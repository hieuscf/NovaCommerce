package oauth

import "github.com/novacommerce/identity-service/internal/application/port"

// Compile-time assertions: ensure concrete adapters satisfy the port interface
// so mismatches are caught at build time rather than at runtime.
var (
	_ port.OAuthProvider     = (*GoogleProvider)(nil)
	_ port.OAuthProvider     = (*FacebookProvider)(nil)
	_ port.OAuthStateManager = (*StateManager)(nil)
)
