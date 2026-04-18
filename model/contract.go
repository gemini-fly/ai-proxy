package model

import (
	"time"
)

const (
	ContractStatusPending  = "pending"
	ContractStatusActive   = "active"
	ContractStatusExpired  = "expired"
	ContractStatusCanceled = "canceled"
)

type Contract struct {
	ID          uint       `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID      int        `json:"user_id" gorm:"index;not null"`
	Title       string     `json:"title" gorm:"not null"`
	CompanyName string     `json:"company_name" gorm:"default:''"` // 乙方公司名称
	Group       string     `json:"group" gorm:"not null"`
	Status      string     `json:"status" gorm:"default:'pending';not null"`
	StartTime   *time.Time `json:"start_time"`
	EndTime     *time.Time `json:"end_time"`
	Remark      string     `json:"remark"`
	CreatedAt   time.Time  `json:"created_at"`
	SignedAt    *time.Time `json:"signed_at"`
}

// ContractWithUser 用于管理员列表，附带用户名
type ContractWithUser struct {
	Contract
	Username    string `json:"username"`
	DisplayName string `json:"display_name"`
}

func GetContractsByUserID(userID int) ([]*Contract, error) {
	var contracts []*Contract
	err := DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&contracts).Error
	return contracts, err
}

func GetAllContracts(page, pageSize int, userID int, keyword string) ([]*ContractWithUser, int64, error) {
	var results []*ContractWithUser
	var total int64

	query := DB.Model(&Contract{}).
		Select("contracts.*, users.username, users.display_name").
		Joins("LEFT JOIN users ON contracts.user_id = users.id")

	if userID > 0 {
		query = query.Where("contracts.user_id = ?", userID)
	}
	if keyword != "" {
		like := "%" + keyword + "%"
		query = query.Where(
			"contracts.company_name LIKE ? OR contracts.title LIKE ? OR users.username LIKE ? OR users.display_name LIKE ?",
			like, like, like, like,
		)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Order("contracts.created_at DESC").Offset(offset).Limit(pageSize).Scan(&results).Error
	return results, total, err
}

func GetContractByID(id uint) (*Contract, error) {
	var contract Contract
	err := DB.First(&contract, id).Error
	if err != nil {
		return nil, err
	}
	return &contract, nil
}

func CreateContract(contract *Contract) error {
	return DB.Create(contract).Error
}

func UpdateContract(contract *Contract) error {
	return DB.Save(contract).Error
}

func DeleteContractByID(id uint) error {
	return DB.Delete(&Contract{}, id).Error
}

// ExpireContracts 将过了有效期的 active 合同自动置为 expired
func ExpireContracts() error {
	now := time.Now()
	return DB.Model(&Contract{}).
		Where("status = ? AND end_time IS NOT NULL AND end_time < ?", ContractStatusActive, now).
		Update("status", ContractStatusExpired).Error
}
