package common

import (
	"fmt"
	"regexp"

	"github.com/go-playground/validator/v10"
)

var Validate *validator.Validate

func init() {
	Validate = validator.New()
}

// fieldNameZh maps struct field names to user-facing Chinese labels.
var fieldNameZh = map[string]string{
	"Username":    "用户名",
	"Password":    "密码",
	"DisplayName": "显示名称",
	"Email":       "邮箱",
	"Remark":      "备注",
}

// TranslateValidationError converts a go-playground/validator error into a
// human-readable Chinese message.
func TranslateValidationError(err error) string {
	verrs, ok := err.(validator.ValidationErrors)
	if !ok || len(verrs) == 0 {
		return "输入内容不合法，请检查后重试"
	}
	ve := verrs[0]

	field := ve.Field()
	label, ok := fieldNameZh[field]
	if !ok {
		label = field
	}

	switch ve.Tag() {
	case "required":
		return fmt.Sprintf("%s不能为空", label)
	case "min":
		return fmt.Sprintf("%s长度至少需要 %s 位", label, ve.Param())
	case "max":
		return fmt.Sprintf("%s长度不能超过 %s 位", label, ve.Param())
	case "email":
		return fmt.Sprintf("%s格式不正确", label)
	case "alphanum":
		return fmt.Sprintf("%s只能包含字母和数字", label)
	default:
		return fmt.Sprintf("%s校验失败（%s），请检查后重试", label, ve.Tag())
	}
}

// StrongPasswordHint is shown to users when password is too weak.
const StrongPasswordHint = "密码强度不足，必须包含大写字母、小写字母、数字及特殊符号（如 !@#$%），且不少于 8 位"

var (
	reHasUpper   = regexp.MustCompile(`[A-Z]`)
	reHasLower   = regexp.MustCompile(`[a-z]`)
	reHasDigit   = regexp.MustCompile(`[0-9]`)
	reHasSpecial = regexp.MustCompile(`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~` + "`" + `]`)
)

// ValidateStrongPassword checks that the password meets complexity requirements:
// at least 8 chars, uppercase, lowercase, digit, and special character.
func ValidateStrongPassword(password string) error {
	if len(password) < 8 {
		return fmt.Errorf("%s，密码至少 8 位", StrongPasswordHint)
	}
	if !reHasUpper.MatchString(password) {
		return fmt.Errorf("%s", StrongPasswordHint)
	}
	if !reHasLower.MatchString(password) {
		return fmt.Errorf("%s", StrongPasswordHint)
	}
	if !reHasDigit.MatchString(password) {
		return fmt.Errorf("%s", StrongPasswordHint)
	}
	if !reHasSpecial.MatchString(password) {
		return fmt.Errorf("%s", StrongPasswordHint)
	}
	return nil
}
