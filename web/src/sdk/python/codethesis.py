"""
CodeThesis AI — Official Python SDK
Enterprise Academic Engineering & Research Copilot Client

Usage:
    from codethesis import CodeThesis
    
    ct = CodeThesis(api_key="ct_live_...")
    balance = ct.get_balance()
    diagram = ct.uml.generate(topic="Student Hostel Clearance System", diagram_type="sequence")
"""

import json
import time
from typing import Dict, Any, Optional, List
import urllib.request
import urllib.error


class CodeThesisError(Exception):
    def __init__(self, message: str, code: str = "api_error", status_code: int = 500, request_id: Optional[str] = None):
        super().__init__(f"[{code}] {message} (Status {status_code})")
        self.code = code
        self.status_code = status_code
        self.request_id = request_id


class _ThesisModule:
    def __init__(self, client):
        self._client = client

    def generate_chapter(
        self,
        topic: str,
        chapter_number: int = 1,
        department: str = "Computer Science / Engineering",
        institution: str = "Tertiary University",
        methodology: str = "Object-Oriented Analysis and Design (OOAD)",
    ) -> Dict[str, Any]:
        return self._client._request(
            "/api/v1/thesis/chapter",
            method="POST",
            payload={
                "topic": topic,
                "chapter_number": chapter_number,
                "department": department,
                "institution": institution,
                "methodology": methodology,
            },
        )

    def check_similarity(
        self,
        text: str,
        topic: str = "Academic Research Project",
        department: str = "Computer Science / Engineering",
    ) -> Dict[str, Any]:
        return self._client._request(
            "/api/v1/thesis/similarity-check",
            method="POST",
            payload={"text": text, "topic": topic, "department": department},
        )


class _UmlModule:
    def __init__(self, client):
        self._client = client

    def generate(
        self,
        topic: str,
        diagram_type: str = "sequence",
        department: str = "Computer Science / Engineering",
    ) -> Dict[str, Any]:
        return self._client._request(
            "/api/v1/uml/generate",
            method="POST",
            payload={"topic": topic, "diagram_type": diagram_type, "department": department},
        )


class _AssignmentModule:
    def __init__(self, client):
        self._client = client

    def solve(
        self,
        problem: str,
        department: str = "Computer Science / Engineering",
        institution: str = "Tertiary University",
    ) -> Dict[str, Any]:
        return self._client._request(
            "/api/v1/assignment/solve",
            method="POST",
            payload={"problem": problem, "department": department, "institution": institution},
        )


class _VivaModule:
    def __init__(self, client):
        self._client = client

    def simulate(
        self,
        topic: str,
        student_answer: str,
        course: str = "Computer Science",
        examiner_persona: str = "strict",
        turn_count: int = 1,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        return self._client._request(
            "/api/v1/viva/simulate",
            method="POST",
            payload={
                "topic": topic,
                "course": course,
                "student_answer": student_answer,
                "examiner_persona": examiner_persona,
                "turn_count": turn_count,
                "history": history or [],
            },
        )


class _JobsModule:
    def __init__(self, client):
        self._client = client

    def create_thesis_job(
        self,
        topic: str,
        chapter_number: int = 1,
        department: str = "Computer Science / Engineering",
        institution: str = "Tertiary University",
        webhook_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        return self._client._request(
            "/api/v1/jobs/thesis",
            method="POST",
            payload={
                "topic": topic,
                "chapter_number": chapter_number,
                "department": department,
                "institution": institution,
                "webhook_url": webhook_url,
            },
        )

    def get(self, job_id: str) -> Dict[str, Any]:
        return self._client._request(f"/api/v1/jobs/{job_id}", method="GET")

    def wait_for_completion(
        self, job_id: str, poll_interval_sec: float = 2.5, max_wait_sec: float = 120.0
    ) -> Dict[str, Any]:
        start = time.time()
        while time.time() - start < max_wait_sec:
            job = self.get(job_id)
            if job.get("status") == "completed":
                return job
            if job.get("status") == "failed":
                raise CodeThesisError(job.get("error") or "Job execution failed", "job_failed", 500)
            time.sleep(poll_interval_sec)
        raise CodeThesisError("Timed out waiting for job completion", "job_timeout", 408)


class CodeThesis:
    """Primary CodeThesis AI Python Client"""

    def __init__(self, api_key: str, base_url: str = "https://codethesis.ai", timeout: float = 45.0):
        if not api_key:
            raise ValueError("CodeThesis requires a valid api_key.")
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

        self.thesis = _ThesisModule(self)
        self.uml = _UmlModule(self)
        self.assignment = _AssignmentModule(self)
        self.viva = _VivaModule(self)
        self.jobs = _JobsModule(self)

    def _request(self, endpoint: str, method: str = "GET", payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "CodeThesis-Python-SDK/1.0.0",
        }

        data_bytes = json.dumps(payload).encode("utf-8") if payload else None
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                body = response.read().decode("utf-8")
                return json.loads(body)
        except urllib.error.HTTPError as exc:
            raw_body = exc.read().decode("utf-8")
            try:
                err_data = json.loads(raw_body).get("error", {})
                message = err_data.get("message", "API request failed")
                code = err_data.get("code", "api_error")
                req_id = err_data.get("request_id")
            except Exception:
                message = raw_body or exc.reason
                code = "http_error"
                req_id = None
            raise CodeThesisError(message, code=code, status_code=exc.code, request_id=req_id) from exc

    def get_balance(self) -> Dict[str, Any]:
        """Fetch remaining credits, rate limits, and plan status."""
        return self._request("/api/v1/account/balance", method="GET")
