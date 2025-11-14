// Next.js instrumentation hook - s'exécute au démarrage du serveur
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('\n🚀 Adventure Tome - Server Starting');
    console.log('📋 Environment Variables:');
    console.log(`  - GA_ID: ${process.env.GA_ID || '❌ NOT SET'}`);
    console.log(`  - NEXT_PUBLIC_APP_VERSION: ${process.env.NEXT_PUBLIC_APP_VERSION || '❌ NOT SET'}`);
    console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);
    console.log('');
  }
}
