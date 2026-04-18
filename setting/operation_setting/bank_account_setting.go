package operation_setting

import "github.com/QuantumNous/new-api/setting/config"

// BankAccountSetting 对公账户设置
type BankAccountSetting struct {
	Enabled     bool   `json:"enabled"`
	CompanyName string `json:"company_name"` // 收款方（公司名称）
	BankName    string `json:"bank_name"`    // 开户银行
	AccountNo   string `json:"account_no"`   // 银行账号
	BankBranch  string `json:"bank_branch"`  // 开户支行（可选）
	Remark      string `json:"remark"`       // 备注（可选）
}

var bankAccountSetting = BankAccountSetting{
	Enabled:     false,
	CompanyName: "",
	BankName:    "",
	AccountNo:   "",
	BankBranch:  "",
	Remark:      "",
}

func init() {
	config.GlobalConfig.Register("bank_account_setting", &bankAccountSetting)
}

func GetBankAccountSetting() *BankAccountSetting {
	return &bankAccountSetting
}
