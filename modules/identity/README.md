# Identity Module

**Bounded Context:** Identity

**Responsibility:** Authentication, credentials, and identity lifecycle (registration, login, sessions, external identity providers).

**Dependencies / Communication:** Publishes domain events (`IdentityRegistered`, `IdentityAuthenticated`, `IdentityDisabled`). Other modules consume identity facts via public contracts and events — never by importing internal entities or repositories.
