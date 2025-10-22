#!/usr/bin/env node

/**
 * Types Structure Validation Script
 * Validates that the new types folder structure is working correctly
 */

const fs = require('fs');
const path = require('path');

const TYPES_FOLDER = 'types';
const REQUIRED_TYPE_FILES = [
  'enums.ts',
  'auth.ts',
  'events.ts',
  'assistant.ts',
  'vendors.ts',
  'attendees.ts',
  'budget.ts',
  'communications.ts',
  'risk.ts',
  'timeline.ts',
  'payments.ts',
  'weather.ts',
  'index.ts'
];

const REQUIRED_ENUMS = [
  'EventType',
  'EventStatus',
  'UserType'
];

const REQUIRED_AUTH_TYPES = [
  'User',
  'ApiResponse',
  'AuthTokens',
  'LoginRequest',
  'RegisterRequest',
  'UserResponse',
  'AuthResponse',
  'RefreshTokenRequest',
  'ValidateTokenRequest',
  'ValidateTokenResponse'
];

const REQUIRED_EVENT_TYPES = [
  'Event',
  'CreateEventRequest',
  'UpdateEventRequest',
  'EventResponse',
  'Location'
];

const REQUIRED_ASSISTANT_TYPES = [
  'ChatRequest',
  'ShadeChatRequest',
  'VenueCardDTO',
  'ChipDTO',
  'EmailTemplateDTO',
  'ActionButtonDTO',
  'StructuredResponseDTO',
  'AssistantChatResponse'
];

function validateTypesFolder() {
  console.log('📁 Validating types folder structure...');
  
  if (!fs.existsSync(TYPES_FOLDER)) {
    console.log(`❌ Types folder not found: ${TYPES_FOLDER}`);
    return false;
  }
  
  let allFilesExist = true;
  for (const file of REQUIRED_TYPE_FILES) {
    const filePath = path.join(TYPES_FOLDER, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - MISSING`);
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

function validateEnums() {
  console.log('\n📝 Validating enums...');
  const enumsPath = path.join(TYPES_FOLDER, 'enums.ts');
  
  if (!fs.existsSync(enumsPath)) {
    console.log('❌ enums.ts not found');
    return false;
  }
  
  const enumsContent = fs.readFileSync(enumsPath, 'utf8');
  let allEnumsExist = true;
  
  for (const enumType of REQUIRED_ENUMS) {
    if (enumsContent.includes(enumType)) {
      console.log(`✅ ${enumType}`);
    } else {
      console.log(`❌ ${enumType} - MISSING`);
      allEnumsExist = false;
    }
  }
  
  return allEnumsExist;
}

function validateAuthTypes() {
  console.log('\n🔐 Validating auth types...');
  const authPath = path.join(TYPES_FOLDER, 'auth.ts');
  
  if (!fs.existsSync(authPath)) {
    console.log('❌ auth.ts not found');
    return false;
  }
  
  const authContent = fs.readFileSync(authPath, 'utf8');
  let allAuthTypesExist = true;
  
  for (const type of REQUIRED_AUTH_TYPES) {
    if (authContent.includes(type)) {
      console.log(`✅ ${type}`);
    } else {
      console.log(`❌ ${type} - MISSING`);
      allAuthTypesExist = false;
    }
  }
  
  return allAuthTypesExist;
}

function validateEventTypes() {
  console.log('\n📅 Validating event types...');
  const eventsPath = path.join(TYPES_FOLDER, 'events.ts');
  
  if (!fs.existsSync(eventsPath)) {
    console.log('❌ events.ts not found');
    return false;
  }
  
  const eventsContent = fs.readFileSync(eventsPath, 'utf8');
  let allEventTypesExist = true;
  
  for (const type of REQUIRED_EVENT_TYPES) {
    if (eventsContent.includes(type)) {
      console.log(`✅ ${type}`);
    } else {
      console.log(`❌ ${type} - MISSING`);
      allEventTypesExist = false;
    }
  }
  
  return allEventTypesExist;
}

function validateAssistantTypes() {
  console.log('\n🤖 Validating assistant types...');
  const assistantPath = path.join(TYPES_FOLDER, 'assistant.ts');
  
  if (!fs.existsSync(assistantPath)) {
    console.log('❌ assistant.ts not found');
    return false;
  }
  
  const assistantContent = fs.readFileSync(assistantPath, 'utf8');
  let allAssistantTypesExist = true;
  
  for (const type of REQUIRED_ASSISTANT_TYPES) {
    if (assistantContent.includes(type)) {
      console.log(`✅ ${type}`);
    } else {
      console.log(`❌ ${type} - MISSING`);
      allAssistantTypesExist = false;
    }
  }
  
  return allAssistantTypesExist;
}

function validateMainTypesFile() {
  console.log('\n📄 Validating main types.ts file...');
  
  if (!fs.existsSync('types.ts')) {
    console.log('❌ Main types.ts file not found');
    return false;
  }
  
  const mainTypesContent = fs.readFileSync('types.ts', 'utf8');
  
  if (mainTypesContent.includes("export * from './types'")) {
    console.log('✅ Main types.ts re-exports from types folder');
    return true;
  } else {
    console.log('❌ Main types.ts does not re-export from types folder');
    return false;
  }
}

function validateImports() {
  console.log('\n🔄 Validating import structure...');
  
  // Check if services can import from the new structure
  const servicesIndexPath = 'services/index.ts';
  if (fs.existsSync(servicesIndexPath)) {
    const servicesContent = fs.readFileSync(servicesIndexPath, 'utf8');
    if (servicesContent.includes("export * from '../types'")) {
      console.log('✅ Services index re-exports types correctly');
      return true;
    } else {
      console.log('❌ Services index does not re-export types correctly');
      return false;
    }
  } else {
    console.log('❌ Services index file not found');
    return false;
  }
}

function main() {
  console.log('🔍 Types Folder Structure Validation');
  console.log('=====================================');
  
  const results = {
    folder: validateTypesFolder(),
    enums: validateEnums(),
    auth: validateAuthTypes(),
    events: validateEventTypes(),
    assistant: validateAssistantTypes(),
    mainFile: validateMainTypesFile(),
    imports: validateImports()
  };
  
  console.log('\n📊 Validation Results:');
  console.log('======================');
  console.log(`Types Folder: ${results.folder ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Enums: ${results.enums ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Auth Types: ${results.auth ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Event Types: ${results.events ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Assistant Types: ${results.assistant ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Main Types File: ${results.mainFile ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Import Structure: ${results.imports ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\nOverall Result: ${allPassed ? '✅ ALL VALIDATIONS PASSED' : '❌ SOME VALIDATIONS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 Types folder structure is correctly implemented!');
    console.log('\nBenefits of the new structure:');
    console.log('• Better organization of related types');
    console.log('• Easier maintenance and updates');
    console.log('• Reduced bundle size with selective imports');
    console.log('• Better developer experience');
    console.log('• Clear separation of concerns');
  } else {
    console.log('\n⚠️  Some validations failed. Please check the output above.');
    process.exit(1);
  }
}

main();
