
const url = "https://txxgmxxssnogumcwsfvn.supabase.co/functions/v1/fetch-solution";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4eGdteHhzc25vZ3VtY3dzZnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MDY3OTcsImV4cCI6MjA4NDE4Mjc5N30.CpsvNMco1a5E3TjzWh37aUwcBvKjKi3WSlbjOKbx6w0";

async function test() {
    console.log("Testing fetch-solution...");

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${anonKey}`
            },
            body: JSON.stringify({
                dtcCode: "P0300",
                vehicleBrand: "Toyota",
                vehicleModel: "Corolla",
                vehicleYear: 2020,
                problemDescription: "Motor falhando"
            })
        });

        console.log("Status:", response.status);

        const text = await response.text();
        console.log("Response Body:", text.substring(0, 500));

    } catch (error) {
        console.error("Error:", error);
    }
}

test();
