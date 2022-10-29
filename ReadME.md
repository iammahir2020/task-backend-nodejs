# Technical Screening Test

## Position: Node.js Developer

## Vouch Digital

### Routes and their use

- get => /getJWTtoken => Route to generate JWT token
- get => /contactBulk => get list of contacts based on pagination infomation (passing page and size as query - which page user is seeing=>page,number of contacts user wants to see=>size)
- get => /contact => get single contact (passing id as query)
- get => /searchByName => get phase matching results matching name (passing name as query)
- get => /contactCount => get number of contacts for creating pages for pagination
- post => /contact => add a new contact (passing contact object in body)
- post => /contactBulk => add bulk contacts (passing array of contact object in body)
- put => /contact => update specific contact (presuming there are three properties (name,email,number) for each contact)
- delete => /contact => delete specific contact (passing id as query)
