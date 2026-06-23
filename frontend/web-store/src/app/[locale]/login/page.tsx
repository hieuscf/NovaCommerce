import { LoginForm } from '@/components/common/auth/login-form';

type LoginPageProps = {
  searchParams: {
    redirect?: string;
    oauthError?: string;
    registered?: string;
    reset?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <LoginForm
      redirectPath={searchParams.redirect}
      oauthError={searchParams.oauthError}
      registered={searchParams.registered}
      reset={searchParams.reset}
    />
  );
}
