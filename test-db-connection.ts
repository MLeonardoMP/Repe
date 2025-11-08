import { getDb } from './src/lib/db';
import { exercises } from './src/lib/db/schema';
import { count } from 'drizzle-orm';

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a Neon...');

    const db = getDb();

    // Test 1: Simple query
    console.log('\n✅ Test 1: Verificando tablas...');
    const result = await db
      .select({ total: count() })
      .from(exercises);
    
    console.log(`   Total de ejercicios en BD: ${result[0].total}`);

    // Test 2: Query con datos
    console.log('\n✅ Test 2: Listando ejercicios...');
    const exercisesList = await db
      .select()
      .from(exercises)
      .limit(3);
    
    if (exercisesList.length > 0) {
      console.log(`   Ejercicios encontrados: ${exercisesList.length}`);
      exercisesList.forEach(ex => {
        console.log(`   - ${ex.name} (${ex.category})`);
      });
    } else {
      console.log('   ℹ️  Aún no hay ejercicios. Corre: npm run seed:exercises');
    }

    console.log('\n✅ CONEXIÓN EXITOSA A NEON');
    console.log(`📊 Database: neondb`);
    console.log(`🌍 Endpoint: ep-misty-forest-a4lologi-pooler.us-east-1.aws.neon.tech`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR DE CONEXIÓN:', error);
    process.exit(1);
  }
}

testConnection();
