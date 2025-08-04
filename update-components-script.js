#!/usr/bin/env node

/**
 * Component Migration Script
 * 
 * Automatically updates components to use migration hooks instead of direct Context usage
 */

const fs = require('fs');
const path = require('path');

const migrations = [
  {
    // Auth migrations
    from: /import { useAuth } from '@\/contexts\/AuthContext';/g,
    to: "import { useAuthMigration } from '@/hooks/useAuthMigration';"
  },
  {
    from: /const { ([^}]+) } = useAuth\(\);/g,
    to: "const { $1 } = useAuthMigration();"
  },
  {
    // Admin migrations  
    from: /import { useAdmin } from '@\/contexts\/AdminContext';/g,
    to: "import { useAdminMigration } from '@/hooks/useAdminMigration';"
  },
  {
    from: /const { ([^}]+) } = useAdmin\(\);/g,
    to: "const { $1 } = useAdminMigration();"
  },
  {
    // Society migrations
    from: /import { useSociety } from '@\/contexts\/SocietyContext';/g,
    to: "import { useSocietyMigration } from '@/hooks/useSocietyMigration';"
  },
  {
    from: /const { ([^}]+) } = useSociety\(\);/g,
    to: "const { $1 } = useSocietyMigration();"
  },
  {
    // Theme migrations
    from: /import { useTheme } from '@\/contexts\/ThemeContext';/g,
    to: "import { useThemeMigration } from '@/hooks/useThemeMigration';"
  },
  {
    from: /const { ([^}]+) } = useTheme\(\);/g,
    to: "const { $1 } = useThemeMigration();"
  },
  {
    // Notification migrations
    from: /import { useNotification } from '@\/contexts\/NotificationContext';/g,
    to: "import { useNotificationMigration } from '@/hooks/useNotificationMigration';"
  },
  {
    from: /const { ([^}]+) } = useNotification\(\);/g,
    to: "const { $1 } = useNotificationMigration();"
  }
];

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  migrations.forEach(migration => {
    if (migration.from.test(content)) {
      content = content.replace(migration.from, migration.to);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

function walkDirectory(dir, extensions = ['.tsx', '.ts']) {
  const files = fs.readdirSync(dir);
  let updatedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, .git, etc.
      if (!file.startsWith('.') && file !== 'node_modules') {
        updatedCount += walkDirectory(filePath, extensions);
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        if (migrateFile(filePath)) {
          updatedCount++;
        }
      }
    }
  });

  return updatedCount;
}

// Run the migration
console.log('🚀 Starting component migration to use migration hooks...\n');

const componentsDir = './components';
const appDir = './app';

let totalUpdated = 0;

if (fs.existsSync(componentsDir)) {
  console.log('📁 Migrating components...');
  totalUpdated += walkDirectory(componentsDir);
}

if (fs.existsSync(appDir)) {
  console.log('📁 Migrating app files...');
  totalUpdated += walkDirectory(appDir);
}

console.log(`\n✨ Migration complete! Updated ${totalUpdated} files.`);

if (totalUpdated > 0) {
  console.log('\n📋 Summary of changes:');
  console.log('  • useAuth() → useAuthMigration()');
  console.log('  • useAdmin() → useAdminMigration()'); 
  console.log('  • useSociety() → useSocietyMigration()');
  console.log('  • useTheme() → useThemeMigration()');
  console.log('  • useNotification() → useNotificationMigration()');
  console.log('\n🧪 Next steps:');
  console.log('  1. Test the migration thoroughly');
  console.log('  2. Enable migration flags for development testing');
  console.log('  3. Remove old context providers when migration is complete');
}