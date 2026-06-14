package port

// EmailService sends transactional emails.
type EmailService interface {
	SendPasswordReset(to, resetToken string) error
	SendWelcome(to, username string) error
}
