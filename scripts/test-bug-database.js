#!/usr/bin/env node

const PatternDatabase = require('../lib/diagnosis/pattern-database');
const PatternMatcher = require('../lib/diagnosis/pattern-matcher');

async function testBugDatabase() {
    console.log('🧪 Testing Bug Pattern Database System');
    console.log('=====================================\n');

    const db = new PatternDatabase();
    const matcher = new PatternMatcher();

    try {
        // Test 1: Database initialization
        console.log('1️⃣  Testing database initialization...');
        await db.initialize();
        const healthInfo = await db.getHealthInfo();
        console.log(`   ✅ Database initialized with ${healthInfo.total_patterns} patterns\n`);

        // Test 2: Pattern matcher initialization
        console.log('2️⃣  Testing pattern matcher initialization...');
        await matcher.initialize();
        console.log(`   ✅ Pattern matcher initialized\n`);

        // Test 3: Test common error patterns
        console.log('3️⃣  Testing error pattern matching...');

        const testErrors = [
            {
                description: 'Error: listen EADDRINUSE :::3000',
                context: { hasReact: true, hasPackageJson: true }
            },
            {
                description: 'Cannot find module \'react-dom\'',
                context: { hasReact: true, packageManager: 'npm' }
            },
            {
                description: 'ENOENT: no such file or directory, open \'.env\'',
                context: { hasEnvExample: true, hasDatabase: true }
            },
            {
                description: 'CORS policy has been blocked by CORS policy',
                context: { hasExpress: true, frontendPort: 3000 }
            }
        ];

        for (const [index, testError] of testErrors.entries()) {
            console.log(`   Testing error ${index + 1}: "${testError.description.substring(0, 50)}..."`);
            const matches = await matcher.findMatches(testError.description, testError.context);

            if (matches.length > 0) {
                console.log(`   ✅ Found ${matches.length} matches (confidence: ${(matches[0].confidence * 100).toFixed(1)}%)`);
                console.log(`      Best match: ${matches[0].name || matches[0].description}`);
            } else {
                console.log(`   ⚠️  No matches found`);
            }
        }
        console.log('');

        // Test 4: Database statistics
        console.log('4️⃣  Testing database statistics...');
        const stats = await matcher.getStatistics();
        console.log(`   ✅ Statistics retrieved:`);
        console.log(`      Total patterns: ${stats.totalPatterns}`);
        console.log(`      Total applications: ${stats.totalApplications || 0}`);
        console.log(`      Average success rate: ${((stats.averageSuccessRate || 0) * 100).toFixed(1)}%`);
        console.log(`      Categories: ${stats.categories || Object.keys(stats.categoryBreakdown || {}).length}`);
        console.log('');

        // Test 5: Pattern search
        console.log('5️⃣  Testing pattern search...');
        const searchResults = await matcher.searchPatterns('port', 'network');
        console.log(`   ✅ Search for 'port' in 'network' category: ${searchResults.length} results`);
        if (searchResults.length > 0) {
            console.log(`      Example: ${searchResults[0].name || searchResults[0].description}`);
        }
        console.log('');

        // Test 6: Success rate simulation
        console.log('6️⃣  Testing success rate tracking...');
        if (searchResults.length > 0) {
            const patternId = searchResults[0].id;
            await matcher.updateSuccessRate(patternId, true, { type: 'test' }, 1500);
            console.log(`   ✅ Updated success rate for pattern ${patternId}`);
        }
        console.log('');

        console.log('🎉 All tests completed successfully!');
        console.log('=====================================');

        // Show final statistics
        const finalStats = await db.getPatternStatistics();
        console.log('\n📊 Final Database Overview:');
        finalStats.forEach(stat => {
            console.log(`   ${stat.category}: ${stat.pattern_count} patterns`);
        });

        await matcher.close();
        await db.close();

    } catch (error) {
        console.error('❌ Test failed:', error);
        await matcher.close();
        await db.close();
        process.exit(1);
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    testBugDatabase().catch(console.error);
}

module.exports = { testBugDatabase };