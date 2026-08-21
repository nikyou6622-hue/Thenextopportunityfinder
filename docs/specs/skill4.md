---
name: nextopportunityfind-zero-hallucination-standard
description: Use this skill whenever writing, modifying, or reviewing any function that generates, formats, summarizes, or presents candidate-facing content in NextOpportunityFind — resume export/tailoring, content quality suggestions, skill-gap-to-action plans, any future interview-prep content, or any new AI-generated or templated feature. Trigger this before writing any function with a fallback/default value for user data, before wiring any new LLM call whose output reaches the candidate, and before code review of anything touching agent4_export_generator.py, agent4_tailor.py, or similar content-generation code. This is a horizontal trust standard, not tied to one phase.
---

# NextOpportunityFind — Zero-Hallucination Content Standard (Skill 4)

This project's core trust promise is that nothing it generates on a
candidate's behalf contains invented facts. That promise was violated twice
already in this codebase — once directly (hardcoded fallback strings
asserting fake job descriptions, degrees, and skills), and once by accident
(an operator-precedence bug that silently dropped real candidate content from
a quality-analysis corpus, producing inaccurate suggestions without anyone
noticing). Both bugs were subtle, shipped past review once, and are exactly
the class of thing this skill exists to catch before it happens a third time.

## The core rule
When a field is missing, empty, or `None`: **omit it, or use a clearly
neutral placeholder that cannot be mistaken for a real fact.** Never
substitute a plausible-sounding default value — not a generic job
description, not a common degree, not a typical skill set, not an assumed
duration. If it would look correct enough that a candidate might not notice
it wasn't theirs, it's not neutral enough.

Good: `"[Add description]"`, omitting a section entirely, returning a
`missing_fields` list alongside the content.
Bad: `"Built scalable backend services and APIs."`, `"Bachelor of Science"`,
a default skill list, a default duration in months — anything specific
enough to read as a real fact about a real person.

## Specific bug patterns to check for (all have happened in this codebase)

**1. Fallback defaults that assert facts.**
Any `.get(key, <specific value>)` where the default is more than an empty
string, empty list, or explicit placeholder constant is suspect. Ask: could
this default be mistaken for something the candidate actually said? If yes,
it's a hallucination risk regardless of how reasonable it sounds as a
"typical" value.

**2. `None` vs missing-key are not the same, and both need handling.**
`profile.get("summary", "")` only returns `""` when the key is absent — if
the value is explicitly `None` (common for nullable DB fields), this returns
`None` and silently breaks any `.split()`/string operation downstream,
producing a crash rather than a hallucination, but from the same root cause
(assuming a default two-arg `.get()` is sufficient). Use `profile.get(key) or
""` (or equivalent explicit `is None` checks) wherever the field can be
`None`, not just absent.

**3. Operator precedence in list/string-building expressions.**
Python's ternary (`x if cond else y`) has lower precedence than `+`. An
expression like:
```python
a + b + c if isinstance(x, list) else str(x)
```
does NOT mean `(a + b + c) if ... else str(x)` — it means
`a + b + (c if isinstance(x, list) else str(x))`. This exact bug silently
dropped title/company/description from the skill-substantiation corpus in
this project's own quality-analysis code. Any time a ternary appears inside
a larger concatenation or list comprehension, parenthesize explicitly and
verify with a concrete test case that includes both branches of the ternary.

**4. Fallback paths that silently degrade to something not equivalent to the primary path.**
The PDF generator once fell back to returning raw Markdown bytes labeled as a
PDF when ReportLab failed — not fabricated candidate content, but a broken
promise about what was delivered, discovered only via `logger.warning`
instead of surfacing the failure. Any `except` block that returns fallback
content must either (a) produce output genuinely equivalent to the primary
path, verified (e.g. checking PDF magic bytes), or (b) raise a clear error
instead of returning something that looks successful but isn't.

## Advisory content vs. generated content — the line
Content-quality suggestions, skill-gap-to-action plans, and similar features
are allowed to **comment on** the candidate's material (flag weak verbs,
suggest adding a metric, propose a resource to close a skill gap) but must
never **insert text that reads as if the candidate wrote it** without the
candidate explicitly authoring or approving that exact text. A suggestion
saying "consider adding a metric here" is fine. Auto-inserting "increased
efficiency by 30%" into a candidate's bullet point is not — even if the
suggestion function has good intentions, that's fabricating a claim on their
behalf. This distinction applies to every future feature under this skill,
including any skill-gap-to-action plan output (per skill_2, Tier 2) and any
reopened interview-prep content.

## Required self-check before shipping any new content-generating function
Answer these explicitly, in a comment or test, before merging:
1. What happens when this field is `None`? (Not "missing" — `None`.)
2. What happens when this field is an empty string or empty list?
3. What happens when this field is present but a different type than
   expected (e.g. a string where a list was expected)?
4. Does any fallback/default value assert a specific fact that could be
   mistaken for real candidate data?
5. If this function has a "primary path" and a "fallback path" (e.g. a
   preferred library with a fallback), does the fallback actually produce
   equivalent output, or does it silently degrade?
6. Write at least one test that exercises each of the above with concrete
   inputs — reusing the fabrication-check test pattern already established in
   this project's export-generator tests.

## Standing rule for any session working on this project
Before marking any content-generation feature "done," re-read this skill's
four bug patterns against the actual diff, not just the intended behavior.
Both prior violations in this codebase passed an initial review that checked
"does this look right" without checking "what does this do on `None`, on an
empty list, on a type mismatch." That's the specific gap this skill exists to
close.