import { EllipsisVertical } from 'lucide-react';
const AVATAR_URL = '/avatar-profile.png';
export function UserFooter() { return <div className="user-footer"><div className="user-avatar"><img src={AVATAR_URL} alt=""/></div><div className="user-copy"><strong>Irfan Khan</strong><span>Admin</span></div><button className="icon-ghost footer-menu" aria-label="User menu"><EllipsisVertical/></button></div>; }
