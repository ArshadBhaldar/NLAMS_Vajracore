import json
import os

POLICY_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "state_rr_policy.json")

with open(POLICY_PATH, "r") as f:
    STATE_POLICIES = json.load(f)


def run_rr_calculation(state: str, parcels: list, land_type: str = "AGRICULTURAL") -> dict:
    """Deliberately deterministic (no LLM) — compensation math has legal and
    financial consequences, so it must be reproducible and auditable rather
    than generated. This mirrors the Right to Fair Compensation and
    Transparency in Land Acquisition, Rehabilitation and Resettlement Act,
    2013 (RFCTLARR) structure: market value assessment + solatium + R&R
    assistance, without hardcoding real government rate schedules.
    """
    policy = STATE_POLICIES.get(state, STATE_POLICIES["default"])
    multiplier = policy["land_type_multipliers"].get(land_type, 1.0)

    breakdown = []
    total_compensation = 0.0

    for parcel in parcels:
        area_sqm = float(parcel.get("claimed_area_sqm") or 0)
        market_value = area_sqm * policy["base_rate_per_sqm"] * multiplier
        solatium = market_value * (policy["solatium_percent"] / 100)
        rr_assistance = policy["rr_assistance_flat"]
        parcel_total = market_value + solatium + rr_assistance

        breakdown.append({
            "parcel_id": parcel.get("id"),
            "owner_name": parcel.get("owner_name"),
            "area_sqm": area_sqm,
            "market_value_assessment": round(market_value, 2),
            "solatium": round(solatium, 2),
            "rr_assistance": round(rr_assistance, 2),
            "total_compensation": round(parcel_total, 2),
        })
        total_compensation += parcel_total

    return {
        "status": "PASS",
        "state": state,
        "land_type_assumed": land_type,
        "policy_notes": policy.get("notes"),
        "parcel_breakdown": breakdown,
        "total_proposal_compensation": round(total_compensation, 2),
    }
