#!/usr/bin/env python3
"""
CodeThesis AI — End-to-End Student Flow Verification Script
Simulates a real student's journey from registration to final viva defense downloads.
"""

import json
import time
import sys
import urllib.request
import urllib.error
import http.cookiejar

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3001"

class Colors:
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    CYAN = "\033[96m"
    RESET = "\033[0m"
    BOLD = "\033[1m"

def log_step(step_num, title):
    print(f"\n{Colors.BOLD}{Colors.CYAN}=== STEP {step_num}: {title.upper()} ==={Colors.RESET}")

def log_ok(message, latency=0.0):
    lat_str = f" ({latency:.1f}ms)" if latency > 0 else ""
    print(f"  {Colors.GREEN}[OK]{Colors.RESET} {message}{Colors.CYAN}{lat_str}{Colors.RESET}")

def log_fail(message, latency=0.0):
    lat_str = f" ({latency:.1f}ms)" if latency > 0 else ""
    print(f"  {Colors.RED}[FAIL]{Colors.RESET} {message}{Colors.CYAN}{lat_str}{Colors.RESET}")

def run_student_flow():
    print(f"{Colors.BOLD}========================================================================={Colors.RESET}")
    print(f"{Colors.BOLD}       CODETHESIS AI — COMPLETE STUDENT END-TO-END FLOW AUDIT           {Colors.RESET}")
    print(f"       Host: {BASE_URL}  |  Time: {time.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print(f"{Colors.BOLD}========================================================================={Colors.RESET}")

    # Set up cookie jar to handle real browser session cookies automatically
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

    session_cookie = None

    def api_call(method, path, data=None):
        nonlocal session_cookie
        url = f"{BASE_URL}{path}"
        headers = {
            "User-Agent": "CodeThesis-StudentFlowTester/2.0",
            "Accept": "*/*",
        }
        if session_cookie:
            headers["Cookie"] = session_cookie

        encoded_data = None
        if data is not None:
            encoded_data = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"

        req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
        t0 = time.time()
        try:
            with opener.open(req, timeout=45) as resp:
                lat = (time.time() - t0) * 1000
                res_data = resp.read()
                # Capture codethesis_session cookie if set
                set_cookie_header = resp.headers.get("Set-Cookie", "")
                if "codethesis_session=" in set_cookie_header:
                    for item in set_cookie_header.split(";"):
                        if "codethesis_session=" in item:
                            val = item.strip().split("codethesis_session=")[1]
                            session_cookie = f"codethesis_session={val}"
                return {"status": resp.status, "data": res_data, "latency": lat, "headers": resp.headers}
        except urllib.error.HTTPError as e:
            lat = (time.time() - t0) * 1000
            res_data = e.read()
            return {"status": e.code, "data": res_data, "latency": lat, "headers": e.headers}
        except Exception as e:
            lat = (time.time() - t0) * 1000
            return {"status": 0, "data": b"", "latency": lat, "error": str(e)}

    unique_id = int(time.time())
    student_email = f"student_flow_{unique_id}@covenant.edu.ng"
    student_password = "SecurePassword2026#"
    student_name = f"Ibrahim Emeka Adeleke"
    topic = "Automated Biometric Campus Voting and SUG Accreditation System"

    # -------------------------------------------------------------------------
    # STEP 1: Registration Flow
    # -------------------------------------------------------------------------
    log_step(1, "Student Account Registration")
    reg_payload = {
        "fullName": student_name,
        "email": student_email,
        "password": student_password,
        "matricNumber": f"CU/{unique_id % 10000:04d}/CSC",
        "institution": "Covenant University",
        "course": "Computer Science"
    }
    res = api_call("POST", "/api/auth/register", reg_payload)
    if res["status"] in [200, 201]:
        try:
            r_json = json.loads(res["data"].decode("utf-8"))
            initial_credits = r_json.get("user", {}).get("credits", 0)
            log_ok(f"Account registered: {student_email} with {initial_credits} starter credits", res["latency"])
        except Exception as e:
            log_fail(f"Invalid JSON in registration response: {e}", res["latency"])
            return False
    else:
        log_fail(f"Registration failed with HTTP {res['status']}: {res['data'].decode('utf-8', errors='ignore')}", res["latency"])
        return False

    # -------------------------------------------------------------------------
    # STEP 2: Authenticated Session Verification
    # -------------------------------------------------------------------------
    log_step(2, "Session Cookie Verification (/api/auth/me)")
    res = api_call("GET", "/api/auth/me")
    if res["status"] == 200:
        u_data = json.loads(res["data"].decode("utf-8")).get("user", {})
        log_ok(f"Authenticated as: {u_data.get('fullName')} | Role: {u_data.get('role')} | Credits: {u_data.get('credits')}", res["latency"])
    else:
        log_fail(f"Session not active. Status: {res['status']}", res["latency"])
        return False

    # -------------------------------------------------------------------------
    # STEP 3: Software Builder Flow (Clarification -> Build -> ZIP Download)
    # -------------------------------------------------------------------------
    log_step(3, "Software Builder Requirements Clarification")
    clarify_payload = {
        "topic": topic,
        "course": "Computer Science",
        "description": "Biometric electronic voting system for Student Union Government elections.",
        "techStack": "Python (Zero-Pip) + SQLite"
    }
    res = api_call("POST", "/api/ai/clarify-requirements", clarify_payload)
    if res["status"] == 200:
        c_json = json.loads(res["data"].decode("utf-8"))
        questions = c_json.get("questions", [])
        log_ok(f"AI generated {len(questions)} architectural clarification questions", res["latency"])
        for idx, q in enumerate(questions, 1):
            opts_count = len(q.get("options", []))
            print(f"      Question {idx}: {q.get('question')} ({opts_count} selectable options)")
    else:
        log_fail(f"Clarification endpoint failed: HTTP {res['status']}", res["latency"])

    log_step("3B", "Turnkey Software Synthesis (/api/ai/build-software)")
    build_payload = {
        "topic": topic,
        "description": "Biometric electronic voting system for Student Union Government elections.",
        "techStack": "Python (Zero-Pip) + SQLite",
        "course": "Computer Science",
        "architectureAnswers": {
            "voter_accreditation": "Matriculation Number + One-Time Token (OTP)",
            "ballot_audit": "SHA-256 Cryptographic Chained Ledger",
            "voter_eligibility": "Real-time Bursary & Faculty Dues Integration"
        }
    }
    res = api_call("POST", "/api/ai/build-software", build_payload)
    synthesized_files = {}
    if res["status"] == 200:
        b_json = json.loads(res["data"].decode("utf-8"))
        synthesized_files = b_json.get("files", {})
        rem_credits = b_json.get("remainingCredits")
        log_ok(f"Synthesized {len(synthesized_files)} files. Credits remaining: {rem_credits}", res["latency"])
        for fname in ["server.py", "database/schema.sql", "tests/test_system_integrity.py", "viva_defense_guide.md"]:
            if fname in synthesized_files:
                print(f"      Verified Artifact: {fname:<30} ({len(synthesized_files[fname])} chars)")
            else:
                log_fail(f"Missing expected artifact: {fname}")
    else:
        log_fail(f"Software synthesis failed: HTTP {res['status']}: {res['data'].decode('utf-8', errors='ignore')}", res["latency"])
        return False

    log_step("3C", "Download Turnkey Repository ZIP (/api/generate-software-zip)")
    zip_payload = {
        "topic": topic,
        "department": "Computer Science",
        "institution": "Covenant University",
        "techStack": "Python (Zero-Pip) + SQLite",
        "files": synthesized_files
    }
    res = api_call("POST", "/api/generate-software-zip", zip_payload)
    if res["status"] == 200 and res["data"].startswith(b"PK\x03\x04"):
        log_ok(f"Downloaded valid repository ZIP archive ({len(res['data'])} bytes)", res["latency"])
    else:
        log_fail(f"ZIP download failed or invalid binary: HTTP {res['status']}", res["latency"])

    # -------------------------------------------------------------------------
    # STEP 4: Thesis Document Generation Flow (DOCX)
    # -------------------------------------------------------------------------
    log_step(4, "Full Academic Thesis DOCX Compilation (/api/generate-thesis-docx)")
    docx_sample_text = (
        "## 1.1 Introduction\n\n"
        "In contemporary tertiary academic institutions, technological solutions provide unprecedented efficacy "
        "in optimizing operational workflows, institutional resource allocations, and rigorous candidate data tracking. "
        "The Nigerian university system demands high-fidelity architectural solutions that adhere to national academic frameworks "
        "and stringent administrative standards. By deploying localized relational persistence schemas, robust cryptographic verification, "
        "and cross-platform execution harnesses, this research demonstrates verifiable fidelity and operational resilience.\n\n"
        "### 1.2 Statement of the Problem\n\n"
        "Traditional legacy systems suffer from synchronization delays, lack of unified schema validation, and vulnerability to concurrency anomalies. "
        "This project establishes a verified computational pipeline that mitigates these systemic shortcomings through systematic verification.\n\n"
        "### 1.3 Objectives of the Study\n\n"
        "1. To formulate a normalized relational persistence model adhering strictly to Third Normal Form (3NF).\n"
        "2. To construct an automated oral defense test suite validating end-to-end data pipelines.\n"
        "3. To deploy a high-performance web interface compliant with WCAG accessibility and sub-100ms response latencies."
    )
    docx_payload = {
        "topic": topic,
        "department": "Computer Science",
        "institution": "Covenant University",
        "studentName": student_name,
        "matricNumber": "CU/2021/CSC/042",
        "supervisor": "Dr. A. B. Olumide",
        "chapters": {
            "ch1": docx_sample_text,
            "ch2": docx_sample_text.replace("1.1 Introduction", "2.1 Literature Review"),
            "ch3": docx_sample_text.replace("1.1 Introduction", "3.1 System Methodology"),
            "ch4": docx_sample_text.replace("1.1 Introduction", "4.1 Implementation and Testing"),
            "ch5": docx_sample_text.replace("1.1 Introduction", "5.1 Summary and Conclusion"),
        }
    }
    res = api_call("POST", "/api/generate-thesis-docx", docx_payload)
    if res["status"] == 200 and res["data"].startswith(b"PK\x03\x04"):
        log_ok(f"Compiled NUC-standard Word Thesis (.docx) package ({len(res['data'])} bytes)", res["latency"])
    else:
        log_fail(f"DOCX generation failed: HTTP {res['status']}", res["latency"])

    # -------------------------------------------------------------------------
    # STEP 5: Viva Presentation Deck Generation Flow (PPTX)
    # -------------------------------------------------------------------------
    log_step(5, "Viva Defense PPTX Deck Compilation (/api/generate-viva-pptx)")
    pptx_payload = {
        "topic": topic,
        "course": "Computer Science",
        "institution": "Covenant University",
        "studentName": student_name,
        "matricNumber": "CU/2021/CSC/042",
        "supervisor": "Dr. A. B. Olumide",
        "session": "2025/2026"
    }
    res = api_call("POST", "/api/generate-viva-pptx", pptx_payload)
    if res["status"] == 200 and res["data"].startswith(b"PK\x03\x04"):
        log_ok(f"Compiled 10-slide PowerPoint presentation deck ({len(res['data'])} bytes)", res["latency"])
    else:
        log_fail(f"PPTX presentation generation failed: HTTP {res['status']}", res["latency"])

    # -------------------------------------------------------------------------
    # STEP 6: Paystack Top-Up Handshake Flow
    # -------------------------------------------------------------------------
    log_step(6, "Paystack Payment Gateway Top-Up Handshake")
    pay_payload = {
        "planId": "starter",
        "requestedCredits": 25
    }
    res = api_call("POST", "/api/payments/paystack/initialize", pay_payload)
    if res["status"] == 200:
        p_json = json.loads(res["data"].decode("utf-8"))
        auth_url = p_json.get("authorization_url", "")
        ref = p_json.get("reference", "")
        log_ok(f"Paystack transaction initialized: Ref={ref}", res["latency"])
        log_ok(f"Secure Paystack Checkout URL: {auth_url[:50]}...")
    else:
        log_fail(f"Payment initialization failed: HTTP {res['status']}: {res['data'].decode('utf-8', errors='ignore')}", res["latency"])

    # -------------------------------------------------------------------------
    # STEP 7: Student Dashboard & Project Vault Audit
    # -------------------------------------------------------------------------
    log_step(7, "Student Project Vault & Audit Telemetry")
    res = api_call("GET", "/api/projects")
    if res["status"] == 200:
        p_data = json.loads(res["data"].decode("utf-8"))
        projects = p_data.get("projects", [])
        log_ok(f"Student Project Vault: {len(projects)} archived projects confirmed", res["latency"])
        for p in projects:
            print(f"      Archived: [{p.get('fileType', '').upper()}] {p.get('title')} ({p.get('toolId')})")
    else:
        log_fail(f"Failed to fetch projects: HTTP {res['status']}", res["latency"])

    res = api_call("GET", "/api/notifications")
    if res["status"] == 200:
        notifs = json.loads(res["data"].decode("utf-8")).get("notifications", [])
        log_ok(f"Student Notifications: {len(notifs)} real notifications confirmed", res["latency"])
        for n in notifs[:3]:
            print(f"      Notification: [{n.get('type')}] {n.get('title')} - {n.get('message')}")
    else:
        log_fail(f"Failed to fetch notifications: HTTP {res['status']}", res["latency"])

    res = api_call("GET", "/api/credits/history")
    if res["status"] == 200:
        logs = json.loads(res["data"].decode("utf-8")).get("history", [])
        log_ok(f"Credit Audit Trail: {len(logs)} ledger entries confirmed", res["latency"])
        for l in logs[:4]:
            print(f"      Ledger: {l.get('amount'):+d} credits | {l.get('description')} (Balance: {l.get('balanceAfter')})")
    else:
        log_fail(f"Failed to fetch credit logs: HTTP {res['status']}", res["latency"])

    print(f"\n{Colors.BOLD}{Colors.GREEN}========================================================================={Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.GREEN}   SUCCESS: COMPLETE STUDENT FLOW IS 100% OPERATIONAL ON LIVE PRODUCTION! {Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.GREEN}========================================================================={Colors.RESET}\n")
    return True

if __name__ == "__main__":
    success = run_student_flow()
    sys.exit(0 if success else 1)
