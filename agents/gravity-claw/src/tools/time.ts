export const getTimeToolDefinition = {
    name: "get_current_time",
    description: "Gets the current local time.",
};

export async function executeGetTime() {
    const now = new Date();
    return `The current local time is ${now.toLocaleString()}`;
}
