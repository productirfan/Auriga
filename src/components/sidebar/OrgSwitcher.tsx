import { ChevronsUpDown } from 'lucide-react';
export function OrgSwitcher({collapsed}: {collapsed:boolean}) { return <button className={`org-switcher ${collapsed?'collapsed':''}`} aria-label="Indian Embassy, Active"><div className="org-avatar">IE</div><div className="org-copy"><strong>Indian Embassy</strong><span><i/>Active</span></div><ChevronsUpDown className="org-chevron"/></button>; }
