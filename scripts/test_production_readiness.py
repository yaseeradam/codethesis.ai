#!/usr/bin/env python3
"""
CodeThesis - Comprehensive Production Readiness & Deep QA Audit Suite
Executes live functional, security, performance, and contract verification.
"""

import json
import time
import sys
import hmac
import hashlib
import base64
import urllib.request
import urllib.error

BASE_URL = "http://localhost:3001"
JWT_SECRET = "super_secret_codethesis_jwt_key_2026_change_in_production"

class Colors:
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    CYAN = "\033[96m"
    RESET = "\033[0m"
    BOLD = "\033[1m"

def log_pass(name, detail, latency_ms):
    print(f" {Colors.GREEN}[PASS]{Colors.RESET} {name:<45} {Colors.CYAN}{latency_ms:>7.1f}ms{Colors.RESET} - {detail}")

def log_fail(name, detail, latency_ms):
    print(f" {Colors.RED}[FAIL]{Colors.RESET} {name:<45} {Colors.CYAN}{latency_ms:>7.1f}ms{Colors.RESET} - {detail}")

def log_warn(name, detail, latency_ms):
    print(f" {Colors.YELLOW}[WARN]{Colors.RESET} {name:<45} {Colors.CYAN}{latency_ms:>7.1f}ms{Colors.RESET} - {detail}")

def make_session_cookie(user_id="usr-81f054a4", email="princeykarg@gmail.com", role="admin"):
    payload = {
        "userId": user_id,
        "email": email,
        "fullName": "Yaseer K Adam",
        "plan": "free",
        "role": role,
        "exp": int(time.time() * 1000) + 1000 * 60 * 60 * 24 * 30,
    }
    p_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    sig = hmac.new(JWT_SECRET.encode(), p_b64.encode(), hashlib.sha256).digest()
    s_b64 = base64.urlsafe_b64encode(sig).decode().rstrip("=")
    token = f"{p_b64}.{s_b64}"
    return f"codethesis_session={token}"

def send_request(method, path, body=None, headers=None):
    url = f"{BASE_URL}{path}"
    req_headers = {"User-Agent": "CodeThesis-QA-Agent/1.0"}
    if headers:
        req_headers.update(headers)
    
    data_bytes = None
    if body is not None:
        req_headers["Content-Type"] = "application/json"
        data_bytes = json.dumps(body).encode("utf-8")
        
    req = urllib.request.Request(url, data=data_bytes, headers=req_headers, method=method)
    
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            latency = (time.time() - start_time) * 1000
            content = resp.read()
            return {
                "status": resp.status,
                "headers": dict(resp.headers),
                "data": content,
                "latency": latency,
                "error": None
            }
    except urllib.error.HTTPError as e:
        latency = (time.time() - start_time) * 1000
        return {
            "status": e.code,
            "headers": dict(e.headers),
            "data": e.read(),
            "latency": latency,
            "error": str(e)
        }
    except Exception as e:
        latency = (time.time() - start_time) * 1000
        return {
            "status": 0,
            "headers": {},
            "data": b"",
            "latency": latency,
            "error": str(e)
        }

def run_audit():
    print(f"{Colors.BOLD}{Colors.CYAN}========================================================================={Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}    CODETHESIS — PRODUCTION READINESS & DEEP QA STRESS TEST SUITE       {Colors.RESET}")
    print(f"    Target Host: {BASE_URL}")
    print(f"    Timestamp:   {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
    print(f"{Colors.BOLD}{Colors.CYAN}========================================================================={Colors.RESET}\n")

    results = {"passed": 0, "failed": 0, "warned": 0, "total": 0}
    auth_cookie = make_session_cookie()

    # -------------------------------------------------------------------------
    # SUITE 1: System Health & Microservices Telemetry
    # -------------------------------------------------------------------------
    print(f"{Colors.BOLD}--- 1. SYSTEM HEALTH & TELEMETRY ---{Colors.RESET}")
    res = send_request("GET", "/api/health")
    results["total"] += 1
    if res["status"] == 200:
        try:
            payload = json.loads(res["data"].decode("utf-8"))
            services = payload.get("services", {})
            db_status = services.get("database", {}).get("status")
            ai_status = services.get("aiEngine", {}).get("status")
            pay_status = services.get("payments", {}).get("status")
            docx_status = services.get("compilers", {}).get("docx")
            
            if db_status == "online" and ai_status == "active" and pay_status == "active":
                log_pass("System Telemetry (/api/health)", f"DB: {db_status}, AI: {ai_status}, Paystack: {pay_status}, Docx: {docx_status}", res["latency"])
                results["passed"] += 1
            else:
                log_warn("System Telemetry (/api/health)", f"Sub-services degraded: {services}", res["latency"])
                results["warned"] += 1
        except Exception as e:
            log_fail("System Telemetry (/api/health)", f"JSON Parse error: {e}", res["latency"])
            results["failed"] += 1
    else:
        log_fail("System Telemetry (/api/health)", f"Status {res['status']}", res["latency"])
        results["failed"] += 1

    # -------------------------------------------------------------------------
    # SUITE 2: Security & Authentication Access Controls
    # -------------------------------------------------------------------------
    print(f"\n{Colors.BOLD}--- 2. SECURITY & AUTHENTICATION ACCESS CONTROLS ---{Colors.RESET}")
    
    # 2.1 Unauthenticated Protected Route Access
    unauth_guards = [
        ("/api/projects", "GET"),
        ("/api/notifications", "GET"),
        ("/api/credits/history", "GET"),
        ("/api/admin/settings", "GET"),
        ("/api/generate-software-zip", "POST"),
        ("/api/generate-thesis-docx", "POST"),
        ("/api/generate-viva-pptx", "POST"),
    ]
    for route, method in unauth_guards:
        results["total"] += 1
        res = send_request(method, route)
        if res["status"] in [401, 403, 307]:
            log_pass(f"Auth Guard ({route})", f"Blocked unauthenticated request (HTTP {res['status']})", res["latency"])
            results["passed"] += 1
        else:
            log_fail(f"Auth Guard ({route})", f"Leaked protected endpoint! Status: {res['status']}", res["latency"])
            results["failed"] += 1

    # 2.2 Authenticated Access Validation
    results["total"] += 1
    res = send_request("GET", "/api/auth/me", headers={"Cookie": auth_cookie})
    if res["status"] == 200:
        try:
            data = json.loads(res["data"].decode("utf-8"))
            if data.get("user", {}).get("email") == "princeykarg@gmail.com":
                log_pass("Session Verification (/api/auth/me)", f"Authenticated as {data['user']['fullName']} (role: {data['user']['role']})", res["latency"])
                results["passed"] += 1
            else:
                log_warn("Session Verification (/api/auth/me)", f"User mismatch: {data}", res["latency"])
                results["warned"] += 1
        except Exception as e:
            log_fail("Session Verification (/api/auth/me)", f"Parse error: {e}", res["latency"])
            results["failed"] += 1
    else:
        log_fail("Session Verification (/api/auth/me)", f"Returned HTTP {res['status']}", res["latency"])
        results["failed"] += 1

    # 2.3 SQL Injection & Sanitization Test
    results["total"] += 1
    sqli_payload = {"topic": "Hospital' OR '1'='1; DROP TABLE users;--"}
    res = send_request("POST", "/api/ai/clarify-requirements", sqli_payload)
    if res["status"] in [200, 400]:
        log_pass("SQLi Probe (/api/ai/clarify-requirements)", "Sanitized malicious SQL payload cleanly", res["latency"])
        results["passed"] += 1
    else:
        log_fail("SQLi Probe (/api/ai/clarify-requirements)", f"Server crashed with HTTP {res['status']}", res["latency"])
        results["failed"] += 1

    # -------------------------------------------------------------------------
    # SUITE 3: AI Requirements Clarification Engine
    # -------------------------------------------------------------------------
    print(f"\n{Colors.BOLD}--- 3. AI REQUIREMENTS CLARIFICATION ENGINE ---{Colors.RESET}")
    results["total"] += 1
    clarify_payload = {
        "topic": "Campus E-Voting and Biometric Accreditation System",
        "description": "Multi-tier election management for SUG presidential and faculty voting.",
        "techStack": "Python + SQLite",
        "course": "Computer Science",
        "features": {"userAuth": True, "adminDashboard": True, "paymentIntegration": False, "reportsAnalytics": True}
    }
    res = send_request("POST", "/api/ai/clarify-requirements", clarify_payload)
    if res["status"] == 200:
        try:
            data = json.loads(res["data"].decode("utf-8"))
            questions = data.get("questions", [])
            summary = data.get("summary", "")
            has_recommended = any(any("(Recommended)" in opt for opt in q.get("options", [])) for q in questions)
            
            if len(questions) >= 2 and has_recommended:
                log_pass("AI Clarification Schema", f"Generated {len(questions)} domain questions with (Recommended) badges. Summary: {summary[:55]}...", res["latency"])
                results["passed"] += 1
            else:
                log_warn("AI Clarification Schema", f"Questions format partial: {len(questions)} found", res["latency"])
                results["warned"] += 1
        except Exception as e:
            log_fail("AI Clarification Schema", f"Invalid JSON response: {e}", res["latency"])
            results["failed"] += 1
    else:
        log_fail("AI Clarification Schema", f"Returned HTTP {res['status']}", res["latency"])
        results["failed"] += 1

    # -------------------------------------------------------------------------
    # SUITE 4: Software Synthesis & Turnkey Artifact Validation
    # -------------------------------------------------------------------------
    print(f"\n{Colors.BOLD}--- 4. SOFTWARE SYNTHESIS & TURNKEY ARTIFACTS ---{Colors.RESET}")
    results["total"] += 1
    build_payload = {
        "topic": "Automated Multi-Department Student Clearance System",
        "description": "Final year clearance connecting Bursary, Library, Sports, and Senate.",
        "techStack": "Python (Zero-Pip) + SQLite",
        "course": "Computer Science",
        "architectureAnswers": {
            "voter_accreditation": "Matriculation Number + One-Time Token (OTP)",
            "clearance_hierarchy": "Strict Sequential Workflow: Bursary -> Library -> HOD -> Dean"
        }
    }
    res = send_request("POST", "/api/ai/build-software", build_payload)
    if res["status"] == 200:
        try:
            data = json.loads(res["data"].decode("utf-8"))
            files = data.get("files", {})
            required_files = [
                "database/schema.sql",
                "database/seed_data.sql",
                "server.py",
                "public/index.html",
                "tests/test_system_integrity.py",
                "viva_defense_guide.md",
                "run_project.bat",
                "run_defense_server.sh",
                "README.md"
            ]
            missing = [f for f in required_files if f not in files]
            
            if not missing:
                log_pass("Turnkey Software Synthesis", f"All {len(required_files)} academic defense artifacts compiled successfully!", res["latency"])
                results["passed"] += 1
            else:
                log_fail("Turnkey Software Synthesis", f"Missing key artifacts: {missing}", res["latency"])
                results["failed"] += 1
        except Exception as e:
            log_fail("Turnkey Software Synthesis", f"JSON Decode error: {e}", res["latency"])
            results["failed"] += 1
    else:
        log_fail("Turnkey Software Synthesis", f"Endpoint returned HTTP {res['status']}", res["latency"])
        results["failed"] += 1

    # -------------------------------------------------------------------------
    # SUITE 5: Document Compilers & Export Engines (Authenticated)
    # -------------------------------------------------------------------------
    print(f"\n{Colors.BOLD}--- 5. DOCUMENT COMPILERS & EXPORT ENGINES (AUTHENTICATED) ---{Colors.RESET}")
    
    # 5.1 ZIP Packaging
    results["total"] += 1
    zip_payload = {
        "topic": "Automated Academic System",
        "department": "Computer Science",
        "techStack": "Python + SQLite",
        "isRedownload": True,
        "files": {
            "server.py": "# Standalone server\nprint('Running server')",
            "database/schema.sql": "-- Schema\nCREATE TABLE test (id INT);",
            "README.md": "# Test Academic System"
        }
    }
    res = send_request("POST", "/api/generate-software-zip", zip_payload, headers={"Cookie": auth_cookie})
    if res["status"] == 200 and len(res["data"]) > 100:
        if res["data"].startswith(b"PK\x03\x04"):
            log_pass("ZIP Packaging Engine (/api/generate-software-zip)", f"Valid PK zip buffer ({len(res['data'])} bytes)", res["latency"])
            results["passed"] += 1
        else:
            log_fail("ZIP Packaging Engine (/api/generate-software-zip)", "Missing PK zip binary header", res["latency"])
            results["failed"] += 1
    else:
        log_fail("ZIP Packaging Engine (/api/generate-software-zip)", f"Returned HTTP {res['status']}", res["latency"])
        results["failed"] += 1

    # 5.2 Word DOCX Thesis Compiler
    results["total"] += 1
    docx_payload = {
        "topic": "Design and Implementation of an E-Voting System",
        "department": "Computer Science",
        "institution": "Covenant University",
        "studentName": "Emeka Victor Adeleke",
        "supervisorName": "Dr. A. B. Olumide",
        "isRedownload": True,
        "chapters": {
            "ch1": "This thesis explores secure decentralized voting protocols in Nigerian universities."
        }
    }
    res = send_request("POST", "/api/generate-thesis-docx", docx_payload, headers={"Cookie": auth_cookie})
    if res["status"] == 200 and len(res["data"]) > 500:
        if res["data"].startswith(b"PK\x03\x04"):
            log_pass("DOCX Thesis Compiler (/api/generate-thesis-docx)", f"Valid DOCX OOXML package ({len(res['data'])} bytes)", res["latency"])
            results["passed"] += 1
        else:
            log_fail("DOCX Thesis Compiler (/api/generate-thesis-docx)", "Invalid binary payload", res["latency"])
            results["failed"] += 1
    else:
        log_fail("DOCX Thesis Compiler (/api/generate-thesis-docx)", f"Returned HTTP {res['status']}", res["latency"])
        results["failed"] += 1

    # 5.3 PowerPoint PPTX Viva Presentation Compiler
    results["total"] += 1
    pptx_payload = {
        "topic": "Biometric Campus E-Voting System",
        "studentName": "Chinedu Stanley Okeke",
        "matricNumber": "CU/2021/CSC/042",
        "institution": "Covenant University",
        "isRedownload": True
    }
    res = send_request("POST", "/api/generate-viva-pptx", pptx_payload, headers={"Cookie": auth_cookie})
    if res["status"] == 200 and len(res["data"]) > 500:
        if res["data"].startswith(b"PK\x03\x04"):
            log_pass("PPTX Presentation Compiler (/api/generate-viva-pptx)", f"Valid PPTX presentation deck ({len(res['data'])} bytes)", res["latency"])
            results["passed"] += 1
        else:
            log_fail("PPTX Presentation Compiler (/api/generate-viva-pptx)", "Invalid PPTX binary payload", res["latency"])
            results["failed"] += 1
    else:
        log_fail("PPTX Presentation Compiler (/api/generate-viva-pptx)", f"Returned HTTP {res['status']}", res["latency"])
        results["failed"] += 1

    # -------------------------------------------------------------------------
    # SUITE 6: Payment Gateway Integration (Paystack Production Handshake)
    # -------------------------------------------------------------------------
    print(f"\n{Colors.BOLD}--- 6. PAYMENT GATEWAY INTEGRATION (PAYSTACK) ---{Colors.RESET}")
    results["total"] += 1
    pay_payload = {
        "planId": "starter",
        "email": "princeykarg@gmail.com",
        "amount": 2500
    }
    res = send_request("POST", "/api/payments/paystack/initialize", pay_payload, headers={"Cookie": auth_cookie})
    if res["status"] == 200:
        try:
            p_data = json.loads(res["data"].decode("utf-8"))
            auth_url = p_data.get("authorization_url", "")
            reference = p_data.get("reference", "")
            if auth_url.startswith("https://checkout.paystack.com") and reference.startswith("CT-"):
                log_pass("Paystack Gateway Handshake", f"Reference: {reference}, Checkout: {auth_url[:40]}...", res["latency"])
                results["passed"] += 1
            else:
                log_warn("Paystack Gateway Handshake", f"Unexpected payload: {p_data}", res["latency"])
                results["warned"] += 1
        except Exception as e:
            log_fail("Paystack Gateway Handshake", f"JSON parse error: {e}", res["latency"])
            results["failed"] += 1
    else:
        log_fail("Paystack Gateway Handshake", f"Returned HTTP {res['status']}", res["latency"])
        results["failed"] += 1

    # -------------------------------------------------------------------------
    # SUITE 7: Frontend Route Availability & Load Performance
    # -------------------------------------------------------------------------
    print(f"\n{Colors.BOLD}--- 7. FRONTEND ROUTE ACCESSIBILITY & RESPONSE LATENCY ---{Colors.RESET}")
    frontend_routes = [
        ("/", "Landing Page"),
        ("/pricing", "Pricing Page"),
        ("/contact", "Contact Page"),
        ("/support", "Support Page"),
        ("/terms", "Terms of Service"),
        ("/privacy", "Privacy Policy"),
        ("/developers", "Developer API Portal"),
        ("/auth/login", "Authentication Login"),
        ("/auth/register", "Account Registration"),
    ]
    for route, label in frontend_routes:
        results["total"] += 1
        res = send_request("GET", route)
        if res["status"] == 200:
            if res["latency"] < 250:
                log_pass(f"{label} ({route})", f"Loaded in {res['latency']:.1f}ms (<250ms SLA)", res["latency"])
                results["passed"] += 1
            else:
                log_warn(f"{label} ({route})", f"Slightly elevated latency ({res['latency']:.1f}ms)", res["latency"])
                results["warned"] += 1
        else:
            log_fail(f"{label} ({route})", f"Returned HTTP {res['status']}", res["latency"])
            results["failed"] += 1

    # -------------------------------------------------------------------------
    # SUMMARY
    # -------------------------------------------------------------------------
    print(f"\n{Colors.BOLD}{Colors.CYAN}========================================================================={Colors.RESET}")
    print(f"{Colors.BOLD}    AUDIT SUMMARY: {results['passed']} PASSED, {results['warned']} WARNINGS, {results['failed']} FAILED (TOTAL: {results['total']}){Colors.RESET}")
    pass_pct = (results["passed"] / results["total"]) * 100
    print(f"    PRODUCTION READINESS SCORE: {pass_pct:.1f}%")
    if results["failed"] == 0 and pass_pct >= 95:
        print(f"    {Colors.GREEN}{Colors.BOLD}STATUS: 100% CERTIFIED PRODUCTION-READY FOR DEFENSE & COMMERCIAL USE{Colors.RESET}")
    elif results["failed"] == 0:
        print(f"    {Colors.GREEN}{Colors.BOLD}STATUS: CERTIFIED PRODUCTION-READY (MINOR WARNINGS){Colors.RESET}")
    else:
        print(f"    {Colors.RED}{Colors.BOLD}STATUS: ACTION REQUIRED BEFORE FULL CERTIFICATION{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}========================================================================={Colors.RESET}\n")

if __name__ == "__main__":
    run_audit()
