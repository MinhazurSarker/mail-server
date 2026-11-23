export function useTranslations(namespace?: string) {
  return (key: string, values?: Record<string, any>) => {
    const dictionary: Record<string, string> = {
      searchPlaceholder: "Search...",
      toggleSidebar: "Toggle Sidebar",
      signOut: "Sign Out",
      editProfile: "Profile",
      accountSettings: "Account Settings",
      support: "Support",
      language: "Language",
      "groups.menu": "Menu",
      "groups.support": "Support",
      "groups.others": "Others",
      customers: "Customers",
      orders: "Orders",
    };
    if (dictionary[key]) return dictionary[key];
    const parts = key.split(".");
    return parts[parts.length - 1] || key;
  };
}

export function useLocale() {
  return "en";
}

export function setRequestLocale(locale: string) {
  // no-op
}

export function getRequestConfig(fn: any) {
  return fn;
}
