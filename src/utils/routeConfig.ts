// Route configuration mapping user roles to clean URLs
export interface RouteMapping {
    userRole: string;
    cleanUrl: string;
    displayName: string;
}

// Clean URL mappings for all user roles
export const ROUTE_MAPPINGS: RouteMapping[] = [
    // Managing Director & Chief
    { userRole: 'managing_director_leader', cleanUrl: '/portal', displayName: 'Portal' },
    { userRole: 'chief', cleanUrl: '/chief', displayName: 'Chief' },

    // General Service
    { userRole: 'general_service_leader', cleanUrl: '/service', displayName: 'Service' },

    // Academic Staff - Coordinator
    { userRole: 'academic_coordinator', cleanUrl: '/dashboard', displayName: 'Dashboard' },

    // Academic Staff - Department Heads
    { userRole: 'computer_science_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'agribusiness_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'accounting_finance_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'animal_science_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'economics_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'general_forestry_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'horticulture_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'management_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'natural_resource_management_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'peace_development_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'plant_science_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'veterinary_science_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'common_course_head', cleanUrl: '/dashboard', displayName: 'Dashboard' },

    // Academic Staff - Teachers
    { userRole: 'computer_science_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'agribusiness_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'accounting_finance_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'animal_science_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'economics_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'general_forestry_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'horticulture_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'management_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'natural_resource_management_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'peace_development_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'plant_science_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'veterinary_science_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },
    { userRole: 'common_course_teacher', cleanUrl: '/dashboard', displayName: 'Dashboard' },

    // Procurement Management
    { userRole: 'procurement_team_leader', cleanUrl: '/workspace', displayName: 'Workspace' },
    { userRole: 'fixed_asset_stock_clerk', cleanUrl: '/workspace', displayName: 'Workspace' },
    { userRole: 'consumable_item_stock_clerk', cleanUrl: '/workspace', displayName: 'Workspace' },
    { userRole: 'fixed_asset_store_keeper', cleanUrl: '/workspace', displayName: 'Workspace' },
    { userRole: 'consumable_item_store_keeper', cleanUrl: '/workspace', displayName: 'Workspace' },

    // Admin Staff
    { userRole: 'hrm_leader', cleanUrl: '/admin-panel', displayName: 'Admin Panel' },
    { userRole: 'finance_leader', cleanUrl: '/admin-panel', displayName: 'Admin Panel' },
    { userRole: 'hrm_employee', cleanUrl: '/admin-panel', displayName: 'Admin Panel' },
    { userRole: 'finance_employee', cleanUrl: '/admin-panel', displayName: 'Admin Panel' },
];

// Helper function to get clean URL for a user role
export function getCleanUrlForRole(userRole: string): string {
    const mapping = ROUTE_MAPPINGS.find(m => m.userRole === userRole);
    return mapping?.cleanUrl || '/';
}

// Helper function to get display name for a user role
export function getDisplayNameForRole(userRole: string): string {
    const mapping = ROUTE_MAPPINGS.find(m => m.userRole === userRole);
    return mapping?.displayName || 'Home';
}

// Public routes that don't require authentication
export const PUBLIC_ROUTES = ['/', '/login'];

// Protected routes that require authentication
export const PROTECTED_ROUTES = ['/dashboard', '/portal', '/service', '/workspace', '/admin-panel', '/chief'];
