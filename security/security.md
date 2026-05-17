# 🔐 Security.md — Web Application Security Essentials

## 📌 Overview

This document provides a baseline security reference for all projects.
It focuses on:

- Core vulnerabilities (SQL Injection, Broken Access Control)
- The OWASP Top 10 (industry-standard risk model)
- Practical prevention strategies

---

# 🛡️ OWASP Top 10 (2021)

The OWASP Top 10 is a standard awareness document for developers and security professionals, representing the most critical security risks to web applications.

---

## 1. Broken Access Control

Users can access resources or perform actions they are not authorized to.

**Examples:**

- Accessing another user’s data via modified URL
- Accessing admin routes without permission

**Prevention:**

- Enforce backend authorization
- Use Role-Based Access Control (RBAC)
- Validate permissions on every request

---

## 2. Cryptographic Failures

Failure to properly protect sensitive data.

**Examples:**

- Plaintext password storage
- Weak or outdated encryption

**Prevention:**

- Use strong hashing (e.g., bcrypt)
- Enforce HTTPS
- Never store sensitive data in plaintext

---

## 3. Injection

Untrusted input is executed as code (e.g., SQL Injection).

---

### 🧨 SQL Injection (SQLi)

#### ❓ What is it?

Occurs when user input is directly inserted into SQL queries without proper handling.

#### 💥 Vulnerable Example

```sql
SELECT * FROM users
WHERE email = 'user_input'
AND password = 'user_input';
```

#### Attack Input:

```sql
' OR 1=1 --
```

#### Result:

Authentication bypass

---

#### 🛡️ Prevention

✅ Use parameterized queries:

```js
db.query("SELECT * FROM users WHERE email = ? AND password = ?", [
  email,
  password,
]);
```

✅ Use ORM tools (Prisma, Sequelize, TypeORM)

❌ Never concatenate raw input into queries

---

## 4. Insecure Design

Security flaws in system architecture.

**Examples:**

- No threat modeling
- No rate limiting
- Weak system assumptions

**Prevention:**

- Design with security in mind
- Perform threat modeling
- Apply secure design patterns

---

## 5. Security Misconfiguration

Improper system setup.

**Examples:**

- Default credentials
- Open cloud storage buckets
- Exposed admin endpoints

**Prevention:**

- Harden configurations
- Disable unused features
- Use environment variables securely

---

## 6. Vulnerable and Outdated Components

Using dependencies with known vulnerabilities.

**Examples:**

- Outdated npm packages
- Unpatched frameworks

**Prevention:**

- Regular dependency updates
- Use tools like `npm audit`
- Monitor CVEs

---

## 7. Identification and Authentication Failures

Weak authentication systems.

**Examples:**

- Weak password policies
- Poor session handling

**Prevention:**

- Use secure authentication (JWT, OAuth)
- Enforce strong passwords
- Implement multi-factor authentication (MFA)

---

## 8. Software and Data Integrity Failures

Untrusted code or data is executed.

**Examples:**

- Unsafe CI/CD pipelines
- Using unverified third-party scripts

**Prevention:**

- Validate all external inputs
- Use trusted sources
- Sign and verify code

---

## 9. Security Logging and Monitoring Failures

Failure to detect and respond to attacks.

**Examples:**

- No logging system
- No alerting on suspicious activity

**Prevention:**

- Implement logging (auth, errors, access)
- Use monitoring tools
- Set up alerts

---

## 10. Server-Side Request Forgery (SSRF)

Server is tricked into making unintended requests.

**Examples:**

- Accessing internal services
- Fetching sensitive metadata

**Prevention:**

- Validate URLs
- Restrict outbound requests
- Use allowlists

---

# 🚫 Broken Access Control (Detailed)

## ❓ What is it?

Occurs when authorization is not properly enforced.

---

## 💥 Example

```
GET /api/user/123
```

Attacker modifies:

```
GET /api/user/124
```

🚨 Result: Unauthorized data access

---

## 🛡️ Prevention

✅ Enforce backend checks

❌ Never trust frontend validation

### Bad:

```js
if (user.id === requestedId) {
  // allow
}
```

### Better:

```js
// Validate ownership securely on server
```

---

# 🔥 Security Checklist

## Input & Data

- [ ] Validate all user inputs
- [ ] Sanitize inputs
- [ ] Use parameterized queries

## Authentication

- [ ] Secure login system (JWT/session)
- [ ] Strong password enforcement
- [ ] MFA (if applicable)

## Authorization

- [ ] Enforce backend access control
- [ ] Implement RBAC
- [ ] Validate every request

## Infrastructure

- [ ] Secure environment variables
- [ ] Disable unused services
- [ ] Enforce HTTPS

## Dependencies

- [ ] Regular updates
- [ ] Run security audits

## Monitoring

- [ ] Log key events
- [ ] Monitor anomalies
- [ ] Set alerts

---

# 🚀 Final Principle

> Build every system as if it will be attacked.

Security is not a feature — it is a foundation.
