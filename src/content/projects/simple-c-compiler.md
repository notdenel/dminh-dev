---
title: "Simple C Compiler"
description: "A multi-phase compiler for a subset of C, including lexical analysis, parsing, semantic analysis, scoped symbol tables, type checking, AST-based code generation for 32-bit x86/Linux Assembly."
technologies:
  - C++
  - x86 Assembly
  - Linux
  - GDB
status: "completed"
type: "coursework"
featured: true
order: 2
startDate: 2026-03
endDate: 2026-06
---

## Overview

This project was a multi-phase compiler for a subset of C, written in C++. It covered front and back ends of a small compiler pipeline.

The compiler included lexical analysis, recursive-descent parsing, semantic analysis, scoped symbol tables, type checking, and code generation for 32-bit x86/Linux assembly.

## What I Built

Across the project, I worked through several major compiler phases:

- Tokenizing source programs
- Parsing declarations, statements, and expressions
- Building and checking scoped symbol tables
- Validating expression types and lvalue rules
- Generating stack frames and function calls
- Emitting assembly for arithmetic, control flow, pointers, strings, casts, and structures

## What I Learned

This project gave me a much better understanding of how high-level code is converted into lower-level instructions. It also gave me more confidence in debugging, as mistakes would show up as incorrect assembly, stack behavior, register state, or runtime output.
