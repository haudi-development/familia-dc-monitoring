'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { AlertRule, AlertCondition, AlertAction, MetricType } from '@/lib/types'
import { DATA_CENTERS, ROOMS } from '@/lib/constants'

interface AlertRuleModalProps {
  rule: AlertRule | null
  isOpen: boolean
  onClose: () => void
  onSave: (rule: Omit<AlertRule, 'id' | 'createdAt' | 'lastTriggered' | 'triggerCount'>) => void
}

export function AlertRuleModal({ rule, isOpen, onClose, onSave }: AlertRuleModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [conditions, setConditions] = useState<AlertCondition[]>([
    { type: 'temperature', operator: '>', value: 0, target: 'any' }
  ])
  const [actions, setActions] = useState<AlertAction[]>([
    { type: 'email', config: { to: '', subject: '' } }
  ])

  useEffect(() => {
    if (rule) {
      setName(rule.name)
      setDescription(rule.description)
      setConditions(rule.conditions)
      setActions(rule.actions)
    } else {
      setName('')
      setDescription('')
      setConditions([{ type: 'temperature', operator: '>', value: 0, target: 'any' }])
      setActions([{ type: 'email', config: { to: '', subject: '' } }])
    }
  }, [rule])

  if (!isOpen) return null

  const handleAddCondition = () => {
    setConditions([...conditions, { type: 'temperature', operator: '>', value: 0, target: 'any' }])
  }

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const handleUpdateCondition = (index: number, field: keyof AlertCondition, value: any) => {
    const updated = [...conditions]
    updated[index] = { ...updated[index], [field]: value }
    setConditions(updated)
  }

  const handleAddAction = () => {
    setActions([...actions, { type: 'email', config: { to: '', subject: '' } }])
  }

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index))
  }

  const handleUpdateAction = (index: number, field: 'type' | 'config', value: any) => {
    const updated = [...actions]
    if (field === 'type') {
      let newConfig = {}
      if (value === 'email') {
        newConfig = { to: '', subject: '' }
      } else if (value === 'webhook') {
        newConfig = { url: '', method: 'POST' }
      } else if (value === 'slack') {
        newConfig = { channel: '', message: '' }
      }
      updated[index] = { type: value, config: newConfig }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setActions(updated)
  }

  const handleSave = () => {
    if (!name || conditions.length === 0 || actions.length === 0) {
      alert('名前、条件、アクションは必須項目です')
      return
    }

    onSave({
      name,
      description,
      enabled: true,
      conditions,
      actions
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-20" onClick={onClose}></div>
        </div>

        <div className="inline-block w-full max-w-3xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {rule ? 'アラートルール編集' : '新規アラートルール'}
          </h2>

          {/* Basic info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ルール名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="例: 高温警告"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                rows={2}
                placeholder="例: ラックの温度が30°Cを超えた場合に通知"
              />
            </div>
          </div>

          {/* Conditions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">条件 (IF)</h3>
              <button
                onClick={handleAddCondition}
                className="flex items-center space-x-1 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
              >
                <Plus className="h-4 w-4" />
                <span>条件追加</span>
              </button>
            </div>
            <div className="space-y-3">
              {conditions.map((condition, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">対象</label>
                        <select
                          value={condition.target}
                          onChange={(e) => handleUpdateCondition(index, 'target', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                        >
                          <option value="any">すべて</option>
                          <option value="room">特定ルーム</option>
                          <option value="rack">特定ラック</option>
                          <option value="sensor">特定センサー</option>
                        </select>
                      </div>
                      {condition.target !== 'any' && (
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">ID</label>
                          <input
                            type="text"
                            value={condition.targetId || ''}
                            onChange={(e) => handleUpdateCondition(index, 'targetId', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                            placeholder={
                              condition.target === 'room' ? 'ROOM-001' :
                              condition.target === 'rack' ? 'RACK-001-A1' :
                              'SEN-001-A1-F'
                            }
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">項目</label>
                        <select
                          value={condition.type}
                          onChange={(e) => handleUpdateCondition(index, 'type', e.target.value as MetricType)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                        >
                          <option value="temperature">温度</option>
                          <option value="humidity">湿度</option>
                          <option value="airflow">風量</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">条件</label>
                        <select
                          value={condition.operator}
                          onChange={(e) => handleUpdateCondition(index, 'operator', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                        >
                          <option value=">">より大きい</option>
                          <option value="<">より小さい</option>
                          <option value="=">と等しい</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">値</label>
                        <input
                          type="number"
                          value={condition.value}
                          onChange={(e) => handleUpdateCondition(index, 'value', parseFloat(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                          placeholder="30"
                        />
                      </div>
                    </div>
                    {conditions.length > 1 && (
                      <button
                        onClick={() => handleRemoveCondition(index)}
                        className="text-red-600 hover:text-red-700 mt-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {index < conditions.length - 1 && (
                    <div className="text-center text-sm text-gray-500 mt-3">かつ</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">アクション (THEN)</h3>
              <button
                onClick={handleAddAction}
                className="flex items-center space-x-1 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
              >
                <Plus className="h-4 w-4" />
                <span>アクション追加</span>
              </button>
            </div>
            <div className="space-y-3">
              {actions.map((action, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <div className="mb-3">
                        <label className="block text-xs text-gray-600 mb-1">アクションタイプ</label>
                        <select
                          value={action.type}
                          onChange={(e) => handleUpdateAction(index, 'type', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                        >
                          <option value="email">メール送信</option>
                          <option value="webhook">Webhook</option>
                          <option value="slack">Slack通知</option>
                        </select>
                      </div>
                      {action.type === 'email' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">宛先</label>
                            <input
                              type="email"
                              value={action.config.to || ''}
                              onChange={(e) => handleUpdateAction(index, 'config', { ...action.config, to: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                              placeholder="admin@example.com"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">件名</label>
                            <input
                              type="text"
                              value={action.config.subject || ''}
                              onChange={(e) => handleUpdateAction(index, 'config', { ...action.config, subject: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                              placeholder="温度警告"
                            />
                          </div>
                        </div>
                      )}
                      {action.type === 'webhook' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">URL</label>
                            <input
                              type="url"
                              value={action.config.url || ''}
                              onChange={(e) => handleUpdateAction(index, 'config', { ...action.config, url: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                              placeholder="https://api.example.com/alerts"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Method</label>
                            <select
                              value={action.config.method || 'POST'}
                              onChange={(e) => handleUpdateAction(index, 'config', { ...action.config, method: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                            >
                              <option value="POST">POST</option>
                              <option value="GET">GET</option>
                              <option value="PUT">PUT</option>
                            </select>
                          </div>
                        </div>
                      )}
                      {action.type === 'slack' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">チャンネル</label>
                            <input
                              type="text"
                              value={action.config.channel || ''}
                              onChange={(e) => handleUpdateAction(index, 'config', { ...action.config, channel: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                              placeholder="#alerts"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">メッセージ</label>
                            <input
                              type="text"
                              value={action.config.message || ''}
                              onChange={(e) => handleUpdateAction(index, 'config', { ...action.config, message: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                              placeholder="アラート: {{rule_name}}"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    {actions.length > 1 && (
                      <button
                        onClick={() => handleRemoveAction(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              {rule ? '更新' : '作成'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}