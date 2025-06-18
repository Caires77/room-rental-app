import Link from 'next/link';

export default function ConfirmEmail() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f7fafc'
    }}>
      <h1 style={{ color: '#2d3748', marginBottom: 16 }}>E-mail confirmado com sucesso!</h1>
      <p style={{ color: '#4a5568', marginBottom: 32 }}>
        Agora você já pode fazer login na sua conta.
      </p>
      <Link href="/ (auth)/login">
        <span style={{
          padding: '12px 32px',
          background: '#3182ce',
          color: '#fff',
          borderRadius: 8,
          textDecoration: 'none',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          Ir para o Login
        </span>
      </Link>
    </div>
  );
} 