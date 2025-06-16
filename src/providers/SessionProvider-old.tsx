import { SessionProvider } from 'next-auth/react'

const SessionProviderComponent = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <SessionProvider session={children.props.session }>
      {children}
    </SessionProvider>
  )
}

export default SessionProviderComponent
