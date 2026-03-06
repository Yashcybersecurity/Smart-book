// Root redirects are handled by middleware.js
// (authenticated → /dashboard, unauthenticated → /login)
export default function RootPage() {
  return null;
}

export async function getServerSideProps() {
  return { redirect: { destination: '/dashboard', permanent: false } };
}

