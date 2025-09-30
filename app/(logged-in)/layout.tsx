import { ProfileImageProvider } from '@/hooks/use-profile-image';

export default function LoggedInLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileImageProvider>
      {children}
    </ProfileImageProvider>
  );
}
