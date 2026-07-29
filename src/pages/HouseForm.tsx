import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Form, Input, InputNumber, Select, Button, Card, Space, Spin,
  Divider, Tag, Row, Col, Checkbox, App, Upload, Image
} from 'antd'
import type { UploadProps, UploadFile } from 'antd'
import {
  PlusOutlined, MinusCircleOutlined, ArrowLeftOutlined,
  InboxOutlined, UploadOutlined
} from '@ant-design/icons'
import { createHouse, updateHouse, getHouseDetail, type HouseDetail } from '../api/house'
import { getCommunities, type CommunityItem } from '../api/community'
import { getAppliances, type ApplianceItem } from '../api/appliance'
import { uploadFile } from '../api/upload'

interface ContactField {
  name: string
  phone?: string | null
  role?: string | null
  is_primary?: number
}

interface FormValues {
  community_id?: number | null
  address?: string | null
  area?: number | null
  floor?: number | null
  total_floors?: number | null
  sale_price?: number | null
  rent_price?: number | null
  price_note?: string | null
  status?: string
  house_type?: string | null
  decoration?: string | null
  key_type?: string
  lock_password?: string | null
  video_url?: string | null
  images?: string[]
  description?: string | null
  contacts?: ContactField[]
  appliance_ids?: number[]
}

const saleStatusOptions = ['空闲', '在售', '已售', '下架']
const rentStatusOptions = ['空闲', '出租中', '已租', '下架']
const houseTypeOptions = ['住宅', '公寓', '别墅', '商铺', '写字楼', '厂房', '其他']
const decorationOptions = ['毛坯', '简装', '精装', '豪装']
const keyTypeOptions = ['无钥匙', '物理钥匙', '密码锁']
const roleOptions = ['业主', '租客', '代理人', '物业']

interface HouseFormProps {
  type?: 'sale' | 'rent'
}

export default function HouseForm({ type: propType }: HouseFormProps) {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [communities, setCommunities] = useState<CommunityItem[]>([])
  const [appliances, setAppliances] = useState<ApplianceItem[]>([])
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([])
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [videoUploading, setVideoUploading] = useState(false)
  const [actualType, setActualType] = useState<'sale' | 'rent'>(propType || 'sale')

  const isSale = actualType === 'sale'
  const statusOptions = isSale ? saleStatusOptions : rentStatusOptions
  const listPath = isSale ? '/houses/sale' : '/houses/rent'

  // 加载小区和家电列表
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [commRes, appRes] = await Promise.all([
          getCommunities({ page: 1, size: 100 }),
          getAppliances(),
        ])
        setCommunities(commRes.items || [])
        setAppliances(appRes.items || [])
      } catch {
        message.error('加载基础数据失败')
      }
    }
    loadMeta()
  }, [message])

  // 编辑模式加载详情
  useEffect(() => {
    if (!id) {
      // 新建模式：根据 propType 设置默认值
      if (propType) {
        setActualType(propType)
        form.setFieldsValue({
          status: '空闲',
          key_type: '无钥匙',
          contacts: [{ name: '', phone: '', role: '', is_primary: 0 }],
          images: [],
          appliance_ids: [],
        })
      }
      return
    }
    setLoading(true)
    getHouseDetail(Number(id))
      .then((detail: HouseDetail) => {
        // 根据数据判断房源用途类型
        let detectedType: 'sale' | 'rent' = 'sale'
        if (detail.sale_price != null && detail.rent_price == null) {
          detectedType = 'sale'
        } else if (detail.rent_price != null && detail.sale_price == null) {
          detectedType = 'rent'
        } else if (detail.sale_price != null && detail.rent_price != null) {
          // 两者都有时，优先按 sale_price 判断
          detectedType = 'sale'
        }
        setActualType(detectedType)

        const applianceIds = detail.appliances?.map((a) => a.appliance_id) || []
        const images = detail.images || []
        form.setFieldsValue({
          community_id: detail.community_id,
          address: detail.address,
          area: detail.area,
          floor: detail.floor,
          total_floors: detail.total_floors,
          sale_price: detail.sale_price,
          rent_price: detail.rent_price,
          price_note: detail.price_note,
          status: detail.status,
          house_type: detail.house_type,
          decoration: detail.decoration,
          key_type: detail.key_type,
          lock_password: detail.lock_password,
          video_url: detail.video_url,
          images,
          description: detail.description,
          contacts: detail.contacts?.length
            ? detail.contacts.map((c) => ({
                name: c.name,
                phone: c.phone,
                role: c.role,
                is_primary: c.is_primary ? 1 : 0,
              }))
            : [{ name: '', phone: '', role: '', is_primary: 0 }],
          appliance_ids: applianceIds,
        })
        // 初始化图片文件列表
        setImageFileList(
          images.map((url, index) => ({
            uid: `existing-${index}`,
            name: url.split('/').pop() || `image-${index}`,
            status: 'done',
            url,
          }))
        )
      })
      .catch(() => message.error('加载房源详情失败'))
      .finally(() => setLoading(false))
  }, [id, form, message, propType])

  // ---------- 图片上传 ----------
  const handleImageUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options
    try {
      const result = await uploadFile(file as File)
      onSuccess?.(result)
      // 同步到表单 images 字段
      const current = form.getFieldValue('images') || []
      form.setFieldValue('images', [...current, result.url])
    } catch (err) {
      const msg = err instanceof Error ? err.message : '上传失败'
      message.error(msg)
      onError?.(err as Error)
    }
  }

  const handleImageChange: UploadProps['onChange'] = (info) => {
    let newFileList = [...info.fileList]
    // 限制只保留已上传完成的文件的 URL，失败的保留但标记错误
    newFileList = newFileList.map((file) => {
      if (file.status === 'done' && file.response) {
        return { ...file, url: file.response.url }
      }
      return file
    })
    setImageFileList(newFileList)
  }

  const handleImageRemove: UploadProps['onRemove'] = (file) => {
    const url = file.url || (file.response as { url?: string })?.url
    if (url) {
      const current = (form.getFieldValue('images') || []) as string[]
      form.setFieldValue('images', current.filter((u) => u !== url))
    }
  }

  // ---------- 视频上传 ----------
  const handleVideoUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options
    setVideoUploading(true)
    try {
      const result = await uploadFile(file as File)
      form.setFieldValue('video_url', result.url)
      message.success('视频上传成功')
      onSuccess?.(result)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '上传失败'
      message.error(msg)
      onError?.(err as Error)
    } finally {
      setVideoUploading(false)
    }
  }

  const handleSubmit = async (values: FormValues) => {
    setSaving(true)
    try {
      // 构造提交数据，字段名与后端对齐
      const payload = {
        community_id: values.community_id ?? null,
        address: values.address || null,
        area: values.area ?? null,
        floor: values.floor ?? null,
        total_floors: values.total_floors ?? null,
        sale_price: isSale ? (values.sale_price ?? null) : null,
        rent_price: isSale ? null : (values.rent_price ?? null),
        price_note: values.price_note || null,
        status: values.status || '空闲',
        house_type: values.house_type || null,
        decoration: values.decoration || null,
        key_type: values.key_type || '无钥匙',
        lock_password: values.lock_password || null,
        video_url: values.video_url || null,
        images: values.images || [],
        description: values.description || null,
        contacts: (values.contacts || [])
          .filter((c) => c.name.trim())
          .map((c) => ({
            name: c.name,
            phone: c.phone || null,
            role: c.role || null,
            is_primary: c.is_primary ? 1 : 0,
          })),
        appliance_ids: (values.appliance_ids || []).map((aid) => ({ appliance_id: aid })),
      }

      if (isEdit) {
        await updateHouse(Number(id), payload)
        message.success('更新成功')
      } else {
        await createHouse(payload)
        message.success('创建成功')
      }
      navigate(listPath)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '保存失败'
      message.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const pageTitle = isEdit
    ? (isSale ? '编辑出售房源' : '编辑出租房源')
    : (isSale ? '新增出售房源' : '新增出租房源')

  return (
    <Spin spinning={loading}>
      <div>
        <div style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(listPath)}>
            返回列表
          </Button>
          <span style={{ marginLeft: 12, fontSize: 18, fontWeight: 600 }}>
            {pageTitle}
          </span>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: '空闲',
            key_type: '无钥匙',
            contacts: [{ name: '', phone: '', role: '', is_primary: 0 }],
            images: [],
            appliance_ids: [],
          }}
        >
          {/* ---------- 房源用途标识 ---------- */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: '#6b7280' }}>房源用途:</span>
              <Tag color={isSale ? '#2d8f5e' : '#2980b9'} style={{ fontSize: 14, padding: '4px 12px' }}>
                {isSale ? '出售' : '出租'}
              </Tag>
              {isEdit && (
                <span style={{ color: '#9ca3af', fontSize: 12 }}>
                  （根据房源数据自动判断，不可修改）
                </span>
              )}
            </div>
          </Card>

          {/* ---------- 基本信息 ---------- */}
          <Card title="基本信息" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="关联小区" name="community_id">
                  <Select
                    placeholder="选择小区"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={communities.map((c) => ({ value: c.id, label: c.name }))}
                  />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item label="详细地址" name="address">
                  <Input placeholder="楼号/单元/门牌" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="面积 (m²)" name="area">
                  <InputNumber style={{ width: '100%' }} min={0} placeholder="0.00" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="所在楼层" name="floor">
                  <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="总楼层" name="total_floors">
                  <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="房源类型" name="house_type">
                  <Select placeholder="选择类型" allowClear options={houseTypeOptions.map((t) => ({ value: t, label: t }))} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ---------- 价格信息 ---------- */}
          <Card title="价格信息" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              {isSale && (
                <Col span={8}>
                  <Form.Item label="出售价格 (万元)" name="sale_price">
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0.00" />
                  </Form.Item>
                </Col>
              )}
              {!isSale && (
                <Col span={8}>
                  <Form.Item label="出租价格 (元/月)" name="rent_price">
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0.00" />
                  </Form.Item>
                </Col>
              )}
              <Col span={8}>
                <Form.Item label="价格备注" name="price_note">
                  <Input placeholder="如：可议价、包物业等" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ---------- 房源属性 ---------- */}
          <Card title="房源属性" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="房源状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
                  <Select options={statusOptions.map((s) => ({ value: s, label: s }))} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="装修状况" name="decoration">
                  <Select placeholder="选择装修" allowClear options={decorationOptions.map((d) => ({ value: d, label: d }))} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="钥匙类型" name="key_type">
                  <Select options={keyTypeOptions.map((k) => ({ value: k, label: k }))} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="密码锁密码" name="lock_password">
                  <Input.Password placeholder="如有密码锁请填写" />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item label="视频">
                  <Space.Compact style={{ width: '100%' }}>
                    <Form.Item name="video_url" noStyle>
                      <Input placeholder="视频 URL，可手动输入或上传自动填充" />
                    </Form.Item>
                    <Upload
                      customRequest={handleVideoUpload}
                      showUploadList={false}
                      accept="video/*"
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />} loading={videoUploading}>
                        {videoUploading ? '上传中' : '上传视频'}
                      </Button>
                    </Upload>
                  </Space.Compact>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ---------- 图片 ---------- */}
          <Card title="房源图片" style={{ marginBottom: 16 }}>
            <Form.Item name="images" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <Image.PreviewGroup>
              {/* 隐藏的 Image 组件，用于控制弹窗预览 */}
              <Image
                style={{ display: 'none' }}
                src={previewImage}
                preview={{
                  visible: previewVisible,
                  onVisibleChange: (visible) => setPreviewVisible(visible),
                }}
              />
              <Upload.Dragger
                multiple
                listType="picture-card"
                fileList={imageFileList}
                customRequest={handleImageUpload}
                onChange={handleImageChange}
                onRemove={handleImageRemove}
                onPreview={(file) => {
                  setPreviewImage(file.url || file.thumbUrl || '')
                  setPreviewVisible(true)
                }}
                accept="image/*"
                showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                style={{ marginTop: 8 }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽图片到此处上传</p>
                <p className="ant-upload-hint">支持多图上传，上传后可预览和删除</p>
              </Upload.Dragger>
            </Image.PreviewGroup>
          </Card>

          {/* ---------- 描述 ---------- */}
          <Card title="房源描述" style={{ marginBottom: 16 }}>
            <Form.Item name="description">
              <Input.TextArea rows={4} placeholder="填写房源描述..." />
            </Form.Item>
          </Card>

          {/* ---------- 联系人 ---------- */}
          <Card title="联系人" style={{ marginBottom: 16 }}>
            <Form.List name="contacts">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: '请输入姓名' }]}>
                        <Input placeholder="姓名" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'phone']}>
                        <Input placeholder="电话" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'role']}>
                        <Select placeholder="角色" style={{ width: 120 }} allowClear options={roleOptions.map((r) => ({ value: r, label: r }))} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'is_primary']} valuePropName="checked">
                        <Checkbox>主要联系人</Checkbox>
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add({ name: '', phone: '', role: '', is_primary: 0 })} icon={<PlusOutlined />}>
                    添加联系人
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

          {/* ---------- 关联家电 ---------- */}
          <Card title="关联家电" style={{ marginBottom: 16 }}>
            <Form.Item name="appliance_ids">
              <Checkbox.Group>
                <Row gutter={[16, 8]}>
                  {appliances.map((app) => (
                    <Col key={app.id}>
                      <Checkbox value={app.id}>{app.name}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
            {appliances.length === 0 && (
              <span style={{ color: '#9ca3af' }}>暂无家电数据，请先到"家电管理"中添加</span>
            )}
          </Card>

          {/* ---------- 提交 ---------- */}
          <Divider />
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={saving} size="large">
                {isEdit ? '保存修改' : '创建房源'}
              </Button>
              <Button onClick={() => navigate(listPath)} size="large">
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Spin>
  )
}
