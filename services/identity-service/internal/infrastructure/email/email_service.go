package email

import (
	"github.com/novacommerce/identity-service/internal/application/port"
	pkglogger "github.com/novacommerce/pkg/logger"
)

// LogEmailService is a stub email sender that logs messages to the console.
type LogEmailService struct {
	logger *pkglogger.Logger
}

// NewLogEmailService creates a LogEmailService.
func NewLogEmailService(logger *pkglogger.Logger) port.EmailService {
	return &LogEmailService{logger: logger}
}

func (s *LogEmailService) SendPasswordReset(to, token string) error {
	s.logger.Info().
		Str("to", to).
		Str("token", token).
		Msg("sending password reset email")
	return nil
}

func (s *LogEmailService) SendWelcome(to, username string) error {
	s.logger.Info().
		Str("to", to).
		Str("username", username).
		Msg("sending welcome email")
	return nil
}
