#!/bin/bash

# Manual Shadcn/UI Component Update Script
# This script can be used to manually update shadcn/ui components
# It includes safety checks and provides options for different update types

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository. Please run this script from the project root."
        exit 1
    fi
}

# Function to check if working tree is clean
check_clean_working_tree() {
    if ! git diff --quiet || ! git diff --cached --quiet; then
        print_error "Working tree is not clean. Please commit or stash your changes first."
        exit 1
    fi
}

# Function to check if shadcn CLI is available
check_shadcn_cli() {
    if ! command -v npx &> /dev/null; then
        print_error "npx is not available. Please install Node.js and npm."
        exit 1
    fi
    
    print_status "Checking shadcn CLI availability..."
    if ! npx shadcn@latest --version &> /dev/null; then
        print_error "Shadcn CLI is not available or not working properly."
        exit 1
    fi
}

# Function to backup components
backup_components() {
    local backup_dir="./backup/shadcn-components-$(date +%Y%m%d-%H%M%S)"
    print_status "Creating backup of current components at $backup_dir"
    
    mkdir -p "$backup_dir"
    if [ -d "./components/ui" ]; then
        cp -r ./components/ui "$backup_dir/"
        print_success "Backup created successfully"
    else
        print_warning "No components/ui directory found to backup"
    fi
}

# Function to check for available updates
check_updates() {
    print_status "Checking for available updates..."
    
    if npx shadcn@latest diff > /tmp/shadcn_diff.txt 2>&1; then
        if grep -q "No updates available" /tmp/shadcn_diff.txt; then
            print_success "No updates available. Your components are up to date!"
            return 1
        else
            print_warning "Updates are available:"
            cat /tmp/shadcn_diff.txt
            return 0
        fi
    else
        print_error "Failed to check for updates:"
        cat /tmp/shadcn_diff.txt
        return 1
    fi
}

# Function to update components
update_components() {
    local force_update=${1:-false}
    
    if [ "$force_update" = true ]; then
        print_status "Force updating all shadcn/ui components..."
    else
        print_status "Updating shadcn/ui components..."
    fi
    
    if npx shadcn@latest add -a -y -o; then
        print_success "Components updated successfully"
        return 0
    else
        print_error "Failed to update components"
        return 1
    fi
}

# Function to show what changed
show_changes() {
    if git diff --quiet; then
        print_success "No changes detected in the working tree"
        return 1
    else
        print_status "The following files were modified:"
        git diff --name-only | grep -E "^components/ui/" | while read -r file; do
            component_name=$(basename "$file" .tsx)
            echo "  - $component_name ($file)"
        done
        
        echo
        print_status "To see detailed changes, run:"
        echo "  git diff"
        echo
        print_status "To see changes for a specific component:"
        echo "  git diff components/ui/[component-name].tsx"
        
        return 0
    fi
}

# Function to create commit
create_commit() {
    local commit_message="chore: update shadcn/ui components to latest versions"
    
    print_status "Creating commit with updated components..."
    
    git add components/ui/
    
    if git diff --cached --quiet; then
        print_warning "No changes to commit"
        return 1
    fi
    
    git commit -m "$commit_message"
    print_success "Changes committed successfully"
    return 0
}

# Main function
main() {
    local force_update=false
    local create_backup=true
    local auto_commit=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force)
                force_update=true
                shift
                ;;
            --no-backup)
                create_backup=false
                shift
                ;;
            --commit)
                auto_commit=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --force       Force update even if no changes detected"
                echo "  --no-backup   Skip creating a backup of current components"
                echo "  --commit      Automatically commit changes after update"
                echo "  --help, -h    Show this help message"
                echo ""
                echo "This script updates shadcn/ui components to their latest versions."
                echo "It includes safety checks and creates backups by default."
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    print_status "Starting shadcn/ui component update process..."
    
    # Safety checks
    check_git_repo
    check_clean_working_tree
    check_shadcn_cli
    
    # Create backup if requested
    if [ "$create_backup" = true ]; then
        backup_components
    fi
    
    # Check for updates (unless force update is enabled)
    if [ "$force_update" = false ] && ! check_updates; then
        exit 0
    fi
    
    # Update components
    if ! update_components "$force_update"; then
        print_error "Update failed. Check the output above for details."
        exit 1
    fi
    
    # Show changes
    if show_changes; then
        # Commit changes if requested
        if [ "$auto_commit" = true ]; then
            create_commit
        else
            echo
            print_status "To commit these changes, run:"
            echo "  git add components/ui/ && git commit -m 'chore: update shadcn/ui components'"
        fi
    fi
    
    print_success "Update process completed successfully!"
}

# Run main function with all arguments
main "$@" 