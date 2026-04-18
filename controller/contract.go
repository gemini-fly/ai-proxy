package controller

import (
	"net/http"
	"strconv"
	"time"

	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

// ---- 管理员接口 ----

// GetAllContracts GET /api/contract/
func GetAllContracts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	userID, _ := strconv.Atoi(c.DefaultQuery("user_id", "0"))
	keyword := c.DefaultQuery("keyword", "")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	_ = model.ExpireContracts()

	contracts, total, err := model.GetAllContracts(page, pageSize, userID, keyword)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    contracts,
		"total":   total,
	})
}

// CreateContract POST /api/contract/
func CreateContract(c *gin.Context) {
	type CreateContractRequest struct {
		UserID      int    `json:"user_id" binding:"required"`
		Title       string `json:"title" binding:"required"`
		CompanyName string `json:"company_name"`
		Group       string `json:"group" binding:"required"`
		StartTime   string `json:"start_time"`
		EndTime     string `json:"end_time"`
		Remark      string `json:"remark"`
	}

	var req CreateContractRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "参数错误：" + err.Error()})
		return
	}

	contract := &model.Contract{
		UserID:      req.UserID,
		Title:       req.Title,
		CompanyName: req.CompanyName,
		Group:       req.Group,
		Status:      model.ContractStatusPending,
		Remark:      req.Remark,
	}

	if req.StartTime != "" {
		t, err := time.Parse(time.RFC3339, req.StartTime)
		if err == nil {
			contract.StartTime = &t
		}
	}
	if req.EndTime != "" {
		t, err := time.Parse(time.RFC3339, req.EndTime)
		if err == nil {
			contract.EndTime = &t
		}
	}

	if err := model.CreateContract(contract); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "创建失败：" + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": contract})
}

// UpdateContract PUT /api/contract/:id
func UpdateContract(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无效的合同ID"})
		return
	}

	contract, err := model.GetContractByID(uint(id))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "合同不存在"})
		return
	}

	type UpdateContractRequest struct {
		Title     string `json:"title"`
		Group     string `json:"group"`
		Status    string `json:"status"`
		StartTime string `json:"start_time"`
		EndTime   string `json:"end_time"`
		Remark    string `json:"remark"`
	}
	var req UpdateContractRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "参数错误：" + err.Error()})
		return
	}

	if req.Title != "" {
		contract.Title = req.Title
	}
	if req.Group != "" {
		contract.Group = req.Group
	}
	if req.Status != "" {
		contract.Status = req.Status
	}
	if req.Remark != "" {
		contract.Remark = req.Remark
	}
	if req.StartTime != "" {
		t, err := time.Parse(time.RFC3339, req.StartTime)
		if err == nil {
			contract.StartTime = &t
		}
	}
	if req.EndTime != "" {
		t, err := time.Parse(time.RFC3339, req.EndTime)
		if err == nil {
			contract.EndTime = &t
		}
	}

	if err := model.UpdateContract(contract); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "更新失败：" + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": contract})
}

// DeleteContract DELETE /api/contract/:id
func DeleteContract(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无效的合同ID"})
		return
	}
	if err := model.DeleteContractByID(uint(id)); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "删除失败：" + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// ---- 用户接口 ----

// GetUserContracts GET /api/user/contract
func GetUserContracts(c *gin.Context) {
	userID := c.GetInt("id")
	_ = model.ExpireContracts()
	contracts, err := model.GetContractsByUserID(userID)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": contracts})
}

// SignContract POST /api/user/contract/:id/sign
func SignContract(c *gin.Context) {
	userID := c.GetInt("id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无效的合同ID"})
		return
	}

	contract, err := model.GetContractByID(uint(id))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "合同不存在"})
		return
	}

	if contract.UserID != userID {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无权操作此合同"})
		return
	}

	if contract.Status != model.ContractStatusPending {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "该合同不在待签署状态"})
		return
	}

	now := time.Now()
	contract.Status = model.ContractStatusActive
	contract.SignedAt = &now

	// 如果合同没有设置开始时间，以签署时间为开始时间
	if contract.StartTime == nil {
		contract.StartTime = &now
	}

	if err := model.UpdateContract(contract); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "签署失败：" + err.Error()})
		return
	}

	// 签署后将用户切换到合同指定分组
	user, err := model.GetUserById(userID, false)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "获取用户信息失败"})
		return
	}
	user.Group = contract.Group
	if err := user.Update(false); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "更新用户分组失败：" + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": contract})
}
