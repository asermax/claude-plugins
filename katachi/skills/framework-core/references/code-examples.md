# Code Examples in Documentation Guide

A guide for including code snippets in feature designs, delta designs, ADRs, and DES pattern documents.

## What are Code Examples?

Code examples are snippets of code included in documentation to illustrate patterns, contracts, or implementation approaches. They should be **generic and minimal**, showing the essence of a pattern rather than actual codebase-specific implementation.

Purpose: Aid conceptual understanding when prose alone is insufficient. Code should complement writing, not replace clear explanations.

## When to Include Code

### Include Code For:
- **DES patterns**: Do/Don't examples are expected and necessary
- **API contracts**: Request/response structure in designs
- **Pattern illustrations**: When showing structure helps understanding
- **Generic examples**: Simplified pseudocode showing an approach

### Skip Code For:
- **Feature specs**: Never include code (specs describe what, not how)
- **Most feature designs**: Prose and diagrams are usually sufficient
- **Most ADRs**: Architectural decisions rarely need code examples
- **Implementation details**: Code examples should not document specific file paths or variable names from the codebase

### Decision Tree

```
Is this a DES pattern document? → YES, include do/don't examples
Is this showing an API contract? → YES, include request/response structure
Is this a feature spec? → NO code ever
Can prose + diagrams explain it clearly? → NO code needed
Does code genuinely aid understanding? → Consider including minimal example
Is this implementation-specific? → NO, keep in code comments instead
```

## General Principles

- **Minimal**: 5-15 lines per example; show only what matters
- **Generic**: Use pseudocode or simplified syntax; avoid codebase specifics
- **Complement prose**: Always explain why the pattern matters, not just what it looks like
- **Pattern essence**: Show the shape of the solution, not the actual implementation
- **Conditional**: Mark code sections as optional; delete if not needed

---

## DES Pattern Examples

DES documents require do/don't examples to establish conventions. Even here, keep examples generic.

### Structure

```markdown
## Examples

### Do This

```
[Generic example showing the pattern essence]
```

**Why**: [Explanation of what makes this good]

### Don't Do This

```
[Generic example showing the anti-pattern]
```

**Why**: [Explanation of what's wrong with this approach]
```

### Good DES Example (Generic)

```markdown
## Examples

### Do This

```python
def process_payment(amount, user_id):
    """Process payment with proper error handling."""
    try:
        result = payment_gateway.charge(amount)
        audit_log.record("payment_success", user_id, amount)
        return result
    except PaymentError as e:
        audit_log.record("payment_failed", user_id, amount, error=str(e))
        raise
```

**Why**: Logs both success and failure; includes context (user_id, amount); re-raises exception for caller to handle.

### Don't Do This

```python
def process_payment(amount, user_id):
    try:
        return payment_gateway.charge(amount)
    except:
        print(f"Error: {e}")
        return None
```

**Why**: Silently swallows errors; no audit trail; bare except catches all errors; print statement doesn't log properly; returning None masks the failure.
```

### Bad DES Example (Too Specific)

**Don't do this**:
```markdown
### Do This

```python
# file: src/payments/stripe_processor.py, line 147
def process_payment(amount, user_id):
    stripe_customer = stripe.Customer.retrieve(user_id)
    payment_method = stripe_customer.default_source
    charge = stripe.Charge.create(
        amount=int(amount * 100),
        currency="usd",
        customer=stripe_customer.id,
        description=f"Order for {user_id}"
    )
    db.session.add(PaymentLog(user_id=user_id, stripe_charge_id=charge.id))
    db.session.commit()
    return charge
```
```

**Why this is bad**: Too specific (Stripe implementation details), too long, references specific file paths, includes vendor-specific APIs that aren't the pattern essence.

---

## API Contracts in Designs

When documenting integration between layers, show the contract shape, not implementation.

### Good API Contract Example

```markdown
### API Contract

**Endpoint**: `POST /api/orders`

**Request**:
```json
{
  "items": [{"product_id": "...", "quantity": 1}],
  "shipping_address": {...}
}
```

**Response** (success):
```json
{
  "order_id": "...",
  "status": "pending",
  "total": 99.99
}
```

**Response** (error):
```json
{
  "error": "insufficient_stock",
  "code": "E_STOCK_001",
  "details": {...}
}
```
```

### Bad API Contract Example

**Don't do this**:
```markdown
See implementation in `api/routes/orders.py:create_order()` which uses:
- OrderValidator from `validators/order.py`
- OrderService from `services/order_service.py`
- Database models from `models/order.py`, `models/order_item.py`
[50 more lines of implementation details]
```

**Why this is bad**: References implementation files instead of showing the contract; no clear structure; requires reading code to understand the API.

---

## Pseudocode for Concepts

When explaining an approach, prefer pseudocode that shows the concept without language-specific details.

### Good Pseudocode Example

```markdown
### Retry Logic

The system retries failed operations with exponential backoff:

```
attempt = 1
while attempt <= max_attempts:
    try:
        result = perform_operation()
        return result
    catch error:
        if not is_retryable(error):
            throw error
        wait(exponential_delay(attempt))
        attempt += 1
throw MaxRetriesExceeded
```

**Key aspects**:
- Only retries on retryable errors
- Exponential backoff prevents overwhelming downstream services
- Fails loudly after max attempts
```

### Bad Pseudocode Example (Too Detailed)

**Don't do this**:
```markdown
```python
import time
import logging
from typing import Callable, TypeVar, Any
from app.exceptions import MaxRetriesExceededError, NonRetryableError
from app.config import settings

T = TypeVar('T')
logger = logging.getLogger(__name__)

def retry_with_backoff(
    func: Callable[[], T],
    max_attempts: int = settings.MAX_RETRY_ATTEMPTS,
    base_delay: float = settings.RETRY_BASE_DELAY,
    max_delay: float = settings.RETRY_MAX_DELAY
) -> T:
    """Retry function with exponential backoff."""
    for attempt in range(1, max_attempts + 1):
        try:
            logger.debug(f"Attempt {attempt}/{max_attempts}")
            return func()
        except NonRetryableError:
            logger.error(f"Non-retryable error on attempt {attempt}")
            raise
        except Exception as e:
            if attempt == max_attempts:
                logger.error(f"Max retries exceeded after {attempt} attempts")
                raise MaxRetriesExceededError(f"Failed after {attempt} attempts") from e
            delay = min(base_delay * (2 ** (attempt - 1)), max_delay)
            logger.warning(f"Attempt {attempt} failed, retrying in {delay}s: {e}")
            time.sleep(delay)
```
```

**Why this is bad**: Too many implementation details, imports, type hints, configuration references, logging statements. The conceptual idea is buried in boilerplate.

---

## When Feature Designs Need Code

Rarely needed, but occasionally helpful for complex modeling or shared contracts.

### Appropriate Use: Validation Rules Shared Across Layers

```markdown
## Shared Logic

### Validation Rules

Both frontend and backend share these validation rules:

```
email: required, valid_email_format, max_length(255)
password: required, min_length(8), contains_uppercase, contains_digit
username: required, alphanumeric, min_length(3), max_length(20)
```

**Why shared**: Ensures consistent user experience; frontend validates for UX, backend validates for security.

**Sharing mechanism**: Generated from shared schema definition file; not manually synchronized.
```

### Inappropriate Use: Showing Implementation

**Don't do this**:
```markdown
## Implementation

```python
class UserValidator:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def validate_email(self, email: str) -> ValidationResult:
        if not email:
            return ValidationResult(valid=False, error="Email required")
        if not re.match(EMAIL_REGEX, email):
            return ValidationResult(valid=False, error="Invalid email format")
        if len(email) > 255:
            return ValidationResult(valid=False, error="Email too long")
        if self.user_repo.email_exists(email):
            return ValidationResult(valid=False, error="Email already taken")
        return ValidationResult(valid=True)
```
```

**Why this is bad**: This is implementation code, not design rationale. Belongs in actual code files with proper tests, not in design docs.

---

## Code in ADR Documents

Rarely needed. ADRs document technology choices and architectural decisions, not code patterns.

### When Code Might Help in an ADR

```markdown
## ADR-015: Use Repository Pattern for Data Access

### Decision

All data access goes through repository interfaces, not direct ORM calls.

### Example Pattern

```
// Service layer
orders = order_repository.find_by_user(user_id)

// NOT this
orders = db.query(Order).filter(Order.user_id == user_id).all()
```

### Why

- Decouples business logic from ORM implementation
- Enables easier testing with mocks
- Centralizes query logic
- Makes it possible to swap ORMs later
```

This is borderline; could be explained in prose alone. Only include if the contrast genuinely helps understanding.

### Skip Code in ADR When

The decision is about technology selection, architecture, or infrastructure—these rarely need code examples:

- "Use PostgreSQL for primary database" → No code needed
- "Deploy on Kubernetes with horizontal autoscaling" → No code needed
- "Use JWT for authentication tokens" → No code needed
- "Adopt microservices architecture" → No code needed

---

## Size Guidelines

### Minimal Examples (5-10 lines)

Best for showing pattern essence:

```python
def process(item):
    validate(item)
    result = transform(item)
    store(result)
    return result
```

### Medium Examples (10-15 lines)

For slightly more complex patterns:

```python
def retry_operation(operation, max_attempts=3):
    for attempt in range(max_attempts):
        try:
            return operation()
        except RetryableError as e:
            if attempt == max_attempts - 1:
                raise
            wait(backoff_delay(attempt))
```

### Too Long (20+ lines)

If your example needs 20+ lines, you're showing too much detail. Either:
- Simplify to show just the pattern essence
- Use pseudocode instead of real code
- Split into multiple smaller examples
- Question whether code is the right tool

---

## Pseudocode vs Real Code

### Use Pseudocode When

- Explaining concepts independent of language
- Showing high-level algorithm flow
- Avoiding language-specific syntax distractions
- Documenting patterns that apply across multiple languages

Example:
```
for each user in active_users:
    if user.needs_notification:
        send_email(user, notification_content)
        mark_as_notified(user)
```

### Use Real Code When

- Showing DES do/don't examples (consistency matters)
- Documenting API contracts (JSON structure)
- Illustrating syntax-specific patterns (decorators, async/await)
- When language choice is part of the decision

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Code as Documentation Replacement

**Don't**:
```markdown
## How It Works

```python
[Paste 100 lines of implementation code]
```
```

**Do**:
```markdown
## How It Works

The system validates input, processes the request, and stores results.

### Validation
[Prose description]

### Processing
[Prose description]

### Storage
[Prose description]
```

### Anti-Pattern 2: Codebase-Specific Examples

**Don't**:
```markdown
See `src/app/services/order_processor.py` lines 147-203 for the implementation.
```

**Do**:
```markdown
### Processing Pattern

```
receive_order()
  -> validate_items()
  -> calculate_total()
  -> charge_payment()
  -> fulfill_order()
```
```

### Anti-Pattern 3: Outdated Code Snippets

**Problem**: Code examples in docs become stale when implementation evolves.

**Solution**: Use generic examples that show patterns, not specific implementation. Generic patterns remain valid even when implementation details change.

---

## Best Practices

### Always Explain Why

```markdown
### Do This

```python
def delete_user(user_id):
    user.deleted_at = now()  # Soft delete
    user.save()
```

**Why**: Soft delete preserves audit trail; allows recovery; maintains referential integrity for foreign keys.
```

The "Why" is more important than the code.

### Use Comments Sparingly in Examples

```python
def process(data):
    validate(data)        # Check input
    result = transform(data)   # Apply business logic
    store(result)         # Save to database
    return result
```

**Don't do this**: Comments in example code are usually redundant. Let the code speak for itself, and put explanations in prose below the example.

### Generic Names for Generic Examples

**Good**: `user`, `item`, `order`, `process`, `validate`
**Bad**: `stripe_customer`, `postgres_connection`, `redis_cache`

Generic names make examples applicable to any implementation.

### Mark Code Sections as Conditional

In templates, make it clear code examples are optional:

```markdown
## Examples

<!--
CONDITIONAL SECTION - Include ONLY when code genuinely clarifies the pattern.
Delete this section if prose is sufficient.
-->
```

---

## Integration with Other Guides

- **Technical Diagrams**: Prefer diagrams for structure; use code for syntax specifics
- **Breadboarding**: Never mix code examples with user flow breadboards (different abstraction levels)
- **Wireframing**: Never mix code with UI wireframes

Each guide serves a different purpose—use the right tool for the right job.

---

## Quick Reference

| Document Type | Code Examples? | Guideline |
|---------------|----------------|-----------|
| Feature Spec | Never | Specs describe what, not how |
| Feature Design | Rarely | Only for API contracts or shared validation; prefer diagrams + prose |
| Delta Spec | Never | Same as feature spec |
| Delta Design | Occasionally | API contracts, shared validation; keep minimal |
| DES Pattern | Always | Do/don't examples required; keep generic |
| ADR | Rarely | Only if code contrast clarifies the decision |

---

## Reconciliation Guidance

When reconciling deltas into feature documentation:

1. **Validate code examples**: Ensure they're still generic and minimal
2. **Check for staleness**: Remove examples that no longer match reality
3. **Simplify**: If implementation added complexity, simplify examples to show pattern essence
4. **Convert to prose**: If code is no longer helpful, replace with clear prose description
5. **Reference guides**: Ensure examples follow this guide's principles
