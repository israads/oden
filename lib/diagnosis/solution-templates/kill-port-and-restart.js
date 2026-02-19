/**
 * Solution template for port already in use errors
 * Kills process on specified port and helps restart the application
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function killPortAndRestart(context) {
    const port = context.port || extractPortFromError(context.errorText) || 3000;
    const solution = {
        steps: [],
        rollbackSteps: [],
        validation: null
    };

    try {
        console.log(`🔍 Checking process on port ${port}...`);

        // Step 1: Identify process using the port
        const findProcessStep = {
            description: `Find process using port ${port}`,
            command: process.platform === 'win32'
                ? `netstat -ano | findstr :${port}`
                : `lsof -ti:${port}`,
            async execute() {
                const { stdout } = await execAsync(this.command);
                return stdout.trim();
            }
        };
        solution.steps.push(findProcessStep);

        const processId = await findProcessStep.execute();

        if (!processId) {
            return {
                success: true,
                message: `Port ${port} is already free`,
                steps: solution.steps
            };
        }

        console.log(`📍 Found process ${processId} using port ${port}`);

        // Step 2: Kill the process
        const killProcessStep = {
            description: `Kill process ${processId} on port ${port}`,
            command: process.platform === 'win32'
                ? `taskkill /PID ${processId} /F`
                : `kill -9 ${processId}`,
            processId,
            async execute() {
                const { stdout } = await execAsync(this.command);
                return stdout;
            }
        };
        solution.steps.push(killProcessStep);

        await killProcessStep.execute();
        console.log(`✅ Killed process ${processId}`);

        // Step 3: Wait a moment for port to be released
        const waitStep = {
            description: 'Wait for port to be released',
            async execute() {
                await new Promise(resolve => setTimeout(resolve, 2000));
                return 'Port release wait completed';
            }
        };
        solution.steps.push(waitStep);

        await waitStep.execute();

        // Step 4: Provide restart instructions
        const restartInstructions = generateRestartInstructions(context);
        console.log(`🚀 ${restartInstructions.message}`);

        solution.validation = async () => {
            try {
                const { stdout } = await execAsync(
                    process.platform === 'win32'
                        ? `netstat -ano | findstr :${port}`
                        : `lsof -ti:${port}`
                );
                return {
                    success: stdout.trim() === '',
                    message: stdout.trim() === ''
                        ? `Port ${port} is now free`
                        : `Port ${port} is still in use`
                };
            } catch (error) {
                // lsof returns error when no process found (which is what we want)
                return {
                    success: true,
                    message: `Port ${port} is now free`
                };
            }
        };

        return {
            success: true,
            message: `Successfully freed port ${port}. ${restartInstructions.message}`,
            steps: solution.steps,
            nextSteps: restartInstructions.commands,
            validation: solution.validation
        };

    } catch (error) {
        return {
            success: false,
            message: `Failed to free port ${port}: ${error.message}`,
            steps: solution.steps,
            error: error.message
        };
    }
}

function extractPortFromError(errorText) {
    const portMatches = errorText.match(/:(\d+)/);
    if (portMatches && portMatches[1]) {
        return parseInt(portMatches[1]);
    }

    // Common development ports
    const commonPorts = [3000, 3001, 8080, 8000, 5000, 4000, 8888];
    for (const port of commonPorts) {
        if (errorText.includes(port.toString())) {
            return port;
        }
    }

    return null;
}

function generateRestartInstructions(context) {
    const packageJsonExists = context.hasPackageJson;

    if (packageJsonExists) {
        // Check common start commands
        const startCommands = [
            'npm start',
            'npm run dev',
            'yarn start',
            'yarn dev'
        ];

        return {
            message: 'You can now restart your application',
            commands: startCommands.filter(cmd => {
                if (context.packageManager === 'yarn' && cmd.startsWith('yarn')) return true;
                if (context.packageManager === 'npm' && cmd.startsWith('npm')) return true;
                return !context.packageManager && cmd.startsWith('npm'); // Default to npm
            })
        };
    }

    return {
        message: 'Port is now free. Restart your application manually.',
        commands: ['# Restart your application with your usual command']
    };
}

module.exports = {
    name: 'kill-port-and-restart',
    description: 'Kill process using a port and provide restart instructions',
    execute: killPortAndRestart,
    platforms: ['win32', 'darwin', 'linux'],
    requirements: ['Port identification capability'],
    riskLevel: 'medium',
    category: 'network'
};