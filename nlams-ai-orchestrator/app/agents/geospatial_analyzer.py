def run_geospatial_analysis(parcels: list) -> dict:
    """The actual spatial ST_Intersects computation happens in Postgres/PostGIS
    at parcel-creation time (see the Node backend's parcel.controller.js) —
    this agent's job is to interpret that result set across all parcels in
    the proposal and produce a single verdict + human-readable summary for
    the CALA Workbench, rather than re-running the spatial query itself.
    """
    if not parcels:
        return {
            "status": "FLAGGED",
            "reason": "No parcels with GPS polygons found for this proposal.",
            "overlapping_parcels": [],
        }

    overlapping = [p for p in parcels if p.get("restricted_zone_overlap")]

    overlap_summary = []
    for p in overlapping:
        zones = p.get("overlap_details") or []
        zone_names = [z.get("zone_name") for z in zones if isinstance(zones, list)]
        overlap_summary.append({
            "parcel_id": p.get("id"),
            "ulpin": p.get("ulpin"),
            "owner_name": p.get("owner_name"),
            "overlapping_zones": zone_names,
        })

    status = "FLAGGED" if overlapping else "PASS"

    return {
        "status": status,
        "total_parcels_checked": len(parcels),
        "overlapping_parcel_count": len(overlapping),
        "overlapping_parcels": overlap_summary,
        "reason": (
            f"{len(overlapping)} of {len(parcels)} parcel(s) intersect a restricted zone "
            "(forest/protected/defense land). Route realignment or special clearance may be required."
            if overlapping else
            "No parcels intersect any known restricted zone."
        ),
    }
