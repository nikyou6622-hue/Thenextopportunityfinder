"""
clusterer.py — Fast near-duplicate title+company clustering for Agent 7
Groups similar roles at the same company under a shared cluster_id (UUID).
Does NOT delete, merge, or modify existing deduplication rows.
"""

import re
import uuid
import logging
from typing import List, Dict, Any, Tuple
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)

def normalize_title_for_clustering(title: str) -> str:
    """Removes common punctuation and extra spaces for fuzzy clustering."""
    clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', (title or '').lower())
    return re.sub(r'\s+', ' ', clean).strip()

def compute_similarity(str1: str, str2: str) -> float:
    """Fast similarity check between two normalized title strings."""
    if str1 == str2:
        return 1.0
    if not str1 or not str2:
        return 0.0
    return SequenceMatcher(None, str1, str2).ratio()

def cluster_jobs(jobs: List[Dict[str, Any]], similarity_threshold: float = 0.75) -> Dict[int, str]:
    """
    Given a list of job dicts (each having 'id', 'company', 'role_title'),
    groups near-duplicate job titles at the same company under a shared cluster_id (UUID string).
    Fast O(N) optimization for single-job companies.
    
    Returns: Dict[job_id, cluster_id]
    """
    company_groups: Dict[str, List[Dict[str, Any]]] = {}
    for j in jobs:
        comp_key = re.sub(r'\s+', ' ', (j.get("company") or "").strip().lower())
        if not comp_key:
            comp_key = "unspecified_company"
        if comp_key not in company_groups:
            company_groups[comp_key] = []
        company_groups[comp_key].append({
            "id": j["id"],
            "title_norm": normalize_title_for_clustering(j.get("role_title") or ""),
            "cluster_id": j.get("cluster_id")
        })
        
    job_cluster_map: Dict[int, str] = {}
    
    for comp_key, comp_jobs in company_groups.items():
        n = len(comp_jobs)
        if n == 1:
            item = comp_jobs[0]
            job_cluster_map[item["id"]] = item["cluster_id"] or str(uuid.uuid4())
            continue

        visited = set()
        for i in range(n):
            if i in visited:
                continue
                
            current = comp_jobs[i]
            group_cluster_id = current["cluster_id"] or str(uuid.uuid4())
            job_cluster_map[current["id"]] = group_cluster_id
            visited.add(i)
            
            # Limit inner comparison loop to max 50 jobs per company group to prevent quadratic slowdown
            for j in range(i + 1, min(n, i + 50)):
                if j in visited:
                    continue
                    
                other = comp_jobs[j]
                sim = compute_similarity(current["title_norm"], other["title_norm"])
                
                if sim >= similarity_threshold:
                    job_cluster_map[other["id"]] = group_cluster_id
                    visited.add(j)
                    
    return job_cluster_map
