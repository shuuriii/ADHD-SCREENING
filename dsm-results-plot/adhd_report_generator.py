"""
ADHD Report Generator
=====================
Pulls assessment data from Supabase and generates PNG chart images.

Charts produced:
  1. presentation_type_pie.png   — patient distribution by ADHD subtype
  2. domain_ab_comparison.png    — Inattention vs Hyperactivity scores
  3. dsm5_criteria_flags.png     — how many patients meet each DSM-5 criterion

Setup (run once in your terminal):
  pip install supabase plotly kaleido pandas python-dotenv

Usage:
  python adhd_report_generator.py
"""

import os
import json
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from supabase import create_client, Client
from dotenv import load_dotenv

# ─────────────────────────────────────────────
# 1. CONFIGURATION — loaded from ../.env.local
# ─────────────────────────────────────────────

# Load environment variables from the parent project's .env.local
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
TABLE_NAME   = "questionnaire_results"
OUTPUT_DIR   = os.path.join(os.path.dirname(__file__), "adhd_charts")

# Brand colours for the charts
COLORS = {
    "combined":      "#6C5CE7",   # purple
    "inattentive":   "#00B894",   # teal
    "hyperactive":   "#E17055",   # orange
    "subthreshold":  "#A29BFE",   # light purple
    "domain_a":      "#0984E3",   # blue  (inattention)
    "domain_b":      "#E84393",   # pink  (hyperactivity)
}


# ─────────────────────────────────────────────
# 2. LOAD DATA FROM SUPABASE
# ─────────────────────────────────────────────

def load_data() -> pd.DataFrame:
    """Connect to Supabase and pull all assessment rows."""
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    response = supabase.table(TABLE_NAME).select("*").execute()

    if not response.data:
        raise ValueError("No data returned from Supabase. Check your table name and credentials.")

    df = pd.DataFrame(response.data)
    print(f"✅ Loaded {len(df)} rows from '{TABLE_NAME}'")
    return df


# ─────────────────────────────────────────────
# 3. CLEAN / PREPARE DATA
# ─────────────────────────────────────────────

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Parse JSON columns and ensure correct types."""

    # Parse responses column if it's stored as a JSON string
    if "responses" in df.columns and df["responses"].dtype == object:
        df["responses"] = df["responses"].apply(
            lambda x: json.loads(x) if isinstance(x, str) else x
        )

    # Ensure numeric columns are actually numbers
    for col in ["domain_a_score", "domain_b_score", "domain_a_total", "domain_b_total"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Normalise presentation_type to lowercase
    if "presentation_type" in df.columns:
        df["presentation_type"] = df["presentation_type"].str.lower().str.strip()

    # Parse DSM-5 flags — handle both dict column and separate columns
    dsm5_flags = ["meets_symptom_threshold", "multiple_settings", "before_age_12", "significant_impact"]
    for flag in dsm5_flags:
        if flag not in df.columns and "dsm5_criteria_flags" in df.columns:
            # If flags are nested inside a JSON column called dsm5_criteria_flags
            df[flag] = df["dsm5_criteria_flags"].apply(
                lambda x: x.get(flag, False) if isinstance(x, dict) else False
            )
        elif flag in df.columns:
            df[flag] = df[flag].astype(bool)

    print("✅ Data cleaned")
    return df


# ─────────────────────────────────────────────
# 4. CHART 1 — Presentation Type Pie Chart
# ─────────────────────────────────────────────

def chart_presentation_pie(df: pd.DataFrame, output_dir: str):
    """Donut chart showing how many patients fall into each ADHD subtype."""

    counts = df["presentation_type"].value_counts().reset_index()
    counts.columns = ["type", "count"]

    # Map colours
    colour_list = [COLORS.get(t, "#DFE6E9") for t in counts["type"]]

    fig = go.Figure(go.Pie(
        labels=counts["type"].str.capitalize(),
        values=counts["count"],
        hole=0.45,                          # donut shape
        marker=dict(colors=colour_list, line=dict(color="white", width=2)),
        textinfo="label+percent",
        hovertemplate="<b>%{label}</b><br>Count: %{value}<br>%{percent}<extra></extra>",
    ))

    fig.update_layout(
        title=dict(text="ADHD Presentation Type Distribution", font=dict(size=20), x=0.5),
        showlegend=True,
        legend=dict(orientation="h", yanchor="bottom", y=-0.15, xanchor="center", x=0.5),
        width=700, height=520,
        paper_bgcolor="white",
        font=dict(family="Inter, Arial", size=13),
        annotations=[dict(text=f"n={len(df)}", x=0.5, y=0.5, showarrow=False,
                          font=dict(size=16, color="#636E72"))]
    )

    path = os.path.join(output_dir, "presentation_type_pie.png")
    fig.write_image(path, scale=2)          # scale=2 → high-res
    print(f"  📊 Saved: {path}")


# ─────────────────────────────────────────────
# 5. CHART 2 — Domain A vs Domain B Comparison
# ─────────────────────────────────────────────

def chart_domain_comparison(df: pd.DataFrame, output_dir: str):
    """
    Two sub-charts side by side:
      Left  — average Domain A (Inattention) vs Domain B (Hyperactivity) totals
      Right — scatter of individual patients (A total vs B total)
    """

    fig = make_subplots(
        rows=1, cols=2,
        subplot_titles=("Average Score by Domain", "Patient Scatter: A vs B Total"),
        horizontal_spacing=0.12,
    )

    # ── Left: Bar chart of averages ──
    avg_a = df["domain_a_total"].mean()
    avg_b = df["domain_b_total"].mean()

    fig.add_trace(go.Bar(
        x=["Inattention (A)", "Hyperactivity (B)"],
        y=[round(avg_a, 1), round(avg_b, 1)],
        marker_color=[COLORS["domain_a"], COLORS["domain_b"]],
        text=[f"{avg_a:.1f}", f"{avg_b:.1f}"],
        textposition="outside",
        width=0.4,
        hovertemplate="%{x}: %{y:.1f}<extra></extra>",
    ), row=1, col=1)

    fig.update_yaxes(title_text="Average Raw Score", range=[0, max(avg_a, avg_b) * 1.3], row=1, col=1)

    # ── Right: Scatter coloured by presentation_type ──
    type_colour_map = {t: c for t, c in COLORS.items() if t in df["presentation_type"].unique()}

    for ptype, group in df.groupby("presentation_type"):
        fig.add_trace(go.Scatter(
            x=group["domain_a_total"],
            y=group["domain_b_total"],
            mode="markers",
            name=ptype.capitalize(),
            marker=dict(
                color=COLORS.get(ptype, "#B2BEC3"),
                size=9,
                opacity=0.75,
                line=dict(color="white", width=0.8)
            ),
            hovertemplate=f"<b>{ptype.capitalize()}</b><br>A: %{{x}}  B: %{{y}}<extra></extra>",
        ), row=1, col=2)

    fig.update_xaxes(title_text="Inattention Total (A)", row=1, col=2)
    fig.update_yaxes(title_text="Hyperactivity Total (B)", row=1, col=2)

    fig.update_layout(
        title=dict(text="Domain A vs Domain B Score Comparison", font=dict(size=20), x=0.5),
        width=1100, height=500,
        paper_bgcolor="white",
        plot_bgcolor="#F8F9FA",
        font=dict(family="Inter, Arial", size=13),
        showlegend=True,
        legend=dict(title="Presentation", orientation="v"),
    )

    path = os.path.join(output_dir, "domain_ab_comparison.png")
    fig.write_image(path, scale=2)
    print(f"  📊 Saved: {path}")


# ─────────────────────────────────────────────
# 6. CHART 3 — DSM-5 Criteria Flags
# ─────────────────────────────────────────────

def chart_dsm5_flags(df: pd.DataFrame, output_dir: str):
    """Horizontal bar showing how many patients meet each DSM-5 criterion."""

    flag_labels = {
        "meets_symptom_threshold": "Meets Symptom\nThreshold",
        "multiple_settings":       "Symptoms in\nMultiple Settings",
        "before_age_12":           "Onset\nBefore Age 12",
        "significant_impact":      "Significant\nFunctional Impact",
    }

    flags    = list(flag_labels.keys())
    labels   = list(flag_labels.values())
    counts   = [int(df[f].sum()) for f in flags if f in df.columns]
    pct      = [round(c / len(df) * 100, 1) for c in counts]
    labels   = [l for f, l in flag_labels.items() if f in df.columns]

    bar_colours = ["#6C5CE7", "#00B894", "#0984E3", "#E17055"][:len(counts)]

    fig = go.Figure(go.Bar(
        x=counts,
        y=labels,
        orientation="h",
        marker=dict(color=bar_colours, line=dict(color="white", width=1)),
        text=[f"{c}  ({p}%)" for c, p in zip(counts, pct)],
        textposition="outside",
        hovertemplate="%{y}: %{x} patients<extra></extra>",
    ))

    fig.update_layout(
        title=dict(text="DSM-5 Criteria — Patients Meeting Each Flag", font=dict(size=20), x=0.5),
        xaxis=dict(title="Number of Patients", range=[0, max(counts) * 1.25] if counts else [0, 10]),
        yaxis=dict(autorange="reversed"),   # top criterion at top
        width=800, height=420,
        paper_bgcolor="white",
        plot_bgcolor="#F8F9FA",
        font=dict(family="Inter, Arial", size=13),
        showlegend=False,
        margin=dict(l=180, r=80, t=70, b=50),
    )

    path = os.path.join(output_dir, "dsm5_criteria_flags.png")
    fig.write_image(path, scale=2)
    print(f"  📊 Saved: {path}")


# ─────────────────────────────────────────────
# 7. MAIN — run everything
# ─────────────────────────────────────────────

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"\n🚀 ADHD Report Generator starting...\n")

    # Step 1 — pull data
    df = load_data()

    # Step 2 — clean data
    df = clean_data(df)

    # Step 3 — generate charts
    print("\n📈 Generating charts...")
    chart_presentation_pie(df, OUTPUT_DIR)
    chart_domain_comparison(df, OUTPUT_DIR)
    chart_dsm5_flags(df, OUTPUT_DIR)

    print(f"\n✅ Done! All charts saved to: {os.path.abspath(OUTPUT_DIR)}\n")


if __name__ == "__main__":
    main()
