# PrimeRoseFarms AI Agent Rules Structure

## Overview

The AI agent rules have been reorganized into focused, priority-based files for better maintainability and clarity. Each file contains related rules grouped by importance and functionality.

## Rule File Hierarchy

### **01-critical-documentation.mdc** (Priority 1 - CRITICAL)
**Always Applied** - Core documentation workflow
- Documentation-first approach
- Mandatory documentation reading before tasks
- Mandatory documentation updates after tasks
- Critical workflow reminders

### **02-code-quality-prevention.mdc** (Priority 2 - CRITICAL)
**Always Applied** - Error prevention and code quality
- TypeScript and React development rules
- Import verification and error prevention
- Component consistency and API validation
- Zero error tolerance standards

### **03-environment-config.mdc** (Priority 3 - HIGH)
**Always Applied** - Development environment setup
- General development rules
- Environment configuration restrictions
- PowerShell usage and file organization
- Version control standards

### **04-architecture-design.mdc** (Priority 4 - HIGH)
**Always Applied** - System architecture and design
- Business process-driven design
- Database and model requirements
- API development standards
- Frontend development guidelines

### **05-security-compliance.mdc** (Priority 5 - MEDIUM)
**Always Applied** - Security and compliance
- Multi-layer encryption requirements
- Permission granularity
- Activity tracking and audit trails
- Testing and quality assurance

### **06-integration-communication.mdc** (Priority 6 - MEDIUM)
**Always Applied** - Integration patterns
- WebSocket implementation
- CORS configuration
- Token management
- Performance optimization

### **07-development-workflow.mdc** (Priority 7 - LOW)
**Always Applied** - Development process
- Module-based development
- Milestone tracking
- Demo user system
- Script automation

## Usage Guidelines

### **For AI Agent:**
1. **Always read** all rule files before starting any task
2. **Follow priority order** - Critical rules take precedence
3. **Apply consistently** - All rules are always applied
4. **Update as needed** - Modify rules based on project evolution

### **For Developers:**
1. **Reference specific files** for focused rule sets
2. **Understand priorities** - Critical rules are non-negotiable
3. **Maintain consistency** - Follow established patterns
4. **Contribute improvements** - Suggest rule enhancements

## Rule File Maintenance

### **Adding New Rules:**
1. **Identify appropriate file** based on rule category
2. **Follow numbering sequence** within the file
3. **Update main-rules.mdc** if new categories are needed
4. **Update this README** with new rule descriptions

### **Modifying Existing Rules:**
1. **Edit the specific rule file** containing the rule
2. **Maintain numbering consistency** within the file
3. **Update cross-references** if rule affects other files
4. **Test rule application** to ensure proper functionality

## Benefits of Modular Structure

### **Maintainability:**
- **Focused files** - Easier to find and modify specific rules
- **Clear priorities** - Understand rule importance at a glance
- **Modular updates** - Change specific rule categories without affecting others

### **Clarity:**
- **Logical grouping** - Related rules are together
- **Priority indication** - Understand rule criticality
- **Easy navigation** - Find rules quickly by category

### **Scalability:**
- **Easy expansion** - Add new rule files as needed
- **Category growth** - Expand specific rule categories
- **Version control** - Track changes to specific rule sets

## File Dependencies

All rule files work together to provide comprehensive guidance:
- **Documentation rules** ensure proper system understanding
- **Code quality rules** prevent common development errors
- **Environment rules** maintain consistent development setup
- **Architecture rules** ensure proper system design
- **Security rules** maintain compliance and safety
- **Integration rules** ensure proper communication patterns
- **Workflow rules** maintain development process consistency

---

**Last Updated:** Rule structure reorganized for better maintainability
**Version:** 4.0
**Project:** PrimeRoseFarms Agricultural Management System
**Focus:** Modular rule structure with priority-based organization
