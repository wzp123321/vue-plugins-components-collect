import readline from 'readline'

/**
 * 创建交互式问答接口
 * @returns {{question: Function, close: Function}} 问答接口对象
 */
export function createQuestionInterface() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return {
    question: (query) =>
      new Promise((resolve) => {
        rl.question(query, resolve)
      }),
    close: () => rl.close(),
  }
}

/**
 * 询问用户输入（带验证）
 * @param {Object} rl - 问答接口对象
 * @param {string} question - 问题
 * @param {Function|null} validator - 验证函数
 * @returns {Promise<string>} 用户输入
 */
export async function askQuestion(rl, question, validator = null) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const answer = await rl.question(question)
    const trimmed = answer.trim()
    if (validator) {
      const validation = validator(trimmed)
      if (!validation.valid) {
        console.log(`   ${validation.message}`)
        console.log('   请重新输入\n')
        // eslint-disable-next-line no-continue
        continue
      }
    }
    return trimmed
  }
}

/**
 * 询问是/否问题
 * @param {Object} rl - 问答接口对象
 * @param {string} question - 问题
 * @returns {Promise<boolean>} 用户选择
 */
export async function askYesNo(rl, question) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const answer = await rl.question(`${question} (Y/N): `)
    const normalized = answer.trim().toUpperCase()
    if (normalized === 'Y' || normalized === 'YES') {
      return true
    }
    if (normalized === 'N' || normalized === 'NO') {
      return false
    }
    console.log('请输入 Y 或 N')
  }
}

/**
 * 询问多选问题
 * @param {Object} rl - 问答接口对象
 * @param {string} question - 问题
 * @param {Array<{label: string, value: any}>} options - 选项列表
 * @returns {Promise<Array>} 用户选择的选项值数组
 */
export async function askMultipleChoice(rl, question, options) {
  console.log(question)
  options.forEach((opt, index) => {
    console.log(`  ${index + 1}. ${opt.label}`)
  })
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const answer = await rl.question(
      '请选择（多个选项用逗号分隔，如：1,2,3）: ',
    )
    const selections = answer
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n) && n > 0 && n <= options.length)
    if (selections.length > 0) {
      return selections.map((s) => options[s - 1].value)
    }
    console.log('请输入有效的选项编号')
  }
}

/**
 * 选择目录（如果有多个）
 * @param {Object} rl - 问答接口对象
 * @param {Array} directories - 目录列表
 * @param {string} type - 目录类型
 * @returns {Promise<string|null>} 选中的目录路径
 */
export async function selectDirectory(rl, directories, type) {
  if (directories.length === 0) {
    return null
  }

  if (directories.length === 1) {
    console.log(
      `✅ 使用检测到的 ${type} 目录: ${directories[0].relativePath}\n`,
    )
    return directories[0].path
  }

  console.log(`\n发现多个 ${type} 目录，请选择:`)
  directories.forEach((dir, index) => {
    console.log(`  ${index + 1}. ${dir.relativePath}`)
  })

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const answer = await rl.question(
      `请选择 ${type} 目录 (1-${directories.length}): `,
    )
    const selection = parseInt(answer.trim(), 10)
    if (selection >= 1 && selection <= directories.length) {
      const selected = directories[selection - 1]
      console.log(`✅ 已选择: ${selected.relativePath}\n`)
      return selected.path
    }
    console.log('请输入有效的选项编号')
  }
}

/**
 * 询问交互形式
 * @param {Object} rl - 问答接口对象
 * @param {string} pageName - 页面名称（新增/编辑/详情）
 * @returns {Promise<string>} 交互形式（dialog/drawer/page）
 */
export async function askInteractionType(rl, pageName) {
  console.log(`\n📋 配置${pageName}页面的交互形式:`)
  console.log('  1. 弹窗 (Dialog) - 在弹窗中显示')
  console.log('  2. 抽屉 (Drawer) - 在侧边抽屉中显示')
  console.log('  3. 单独页面 (Page) - 跳转到独立页面')

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const answer = await rl.question(`请选择${pageName}页面的交互形式 (1-3): `)
    const selection = parseInt(answer.trim(), 10)
    if (selection === 1) {
      console.log(`✅ ${pageName}页面将使用弹窗形式\n`)
      return 'dialog'
    }
    if (selection === 2) {
      console.log(`✅ ${pageName}页面将使用抽屉形式\n`)
      return 'drawer'
    }
    if (selection === 3) {
      console.log(`✅ ${pageName}页面将使用单独页面形式\n`)
      return 'page'
    }
    console.log('请输入有效的选项编号 (1-3)')
  }
}

/**
 * 询问搜索条件配置
 * @param {Object} rl - 问答接口对象
 * @returns {Promise<Array<{label: string, field: string}>>} 搜索条件配置数组
 */
export async function askSearchFields(rl) {
  const searchFields = []
  console.log('\n📋 配置搜索条件（每个搜索框需要输入标签和字段名）')
  console.log('提示：输入完成后，当询问是否继续添加时选择 N 即可退出\n')

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const label = await askQuestion(
      rl,
      `请输入搜索框标签（如：姓名、编号等，直接回车跳过）: `,
    )

    // 如果用户直接回车，询问是否继续
    if (!label) {
      // eslint-disable-next-line no-await-in-loop
      const continueAdd = await askYesNo(rl, '是否继续添加搜索条件？')
      if (!continueAdd) {
        break
      }
      // 继续下一次循环，不执行后续代码
    } else {
      // eslint-disable-next-line no-await-in-loop
      const field = await askQuestion(
        rl,
        `请输入对应的字段名（驼峰命名，如：userName、phoneNumber）: `,
        (value) => {
          if (!value.trim()) {
            return { valid: false, message: '❌ 字段名不能为空' }
          }
          // 验证是否为有效的驼峰命名
          if (!/^[a-z][a-zA-Z0-9]*$/.test(value.trim())) {
            return {
              valid: false,
              message:
                '❌ 字段名必须使用驼峰命名（首字母小写，只能包含字母和数字）',
            }
          }
          return { valid: true }
        },
      )

      searchFields.push({
        label: label.trim(),
        field: field.trim(),
      })

      console.log(`✅ 已添加搜索条件: ${label.trim()} (${field.trim()})\n`)

      // 询问是否继续添加
      // eslint-disable-next-line no-await-in-loop
      const continueAdd = await askYesNo(rl, '是否继续添加搜索条件？')
      if (!continueAdd) {
        break
      }
      console.log('')
    }
  }

  return searchFields
}

/**
 * 询问搜索字段类型
 * @param {Object} rl - 问答接口对象
 * @returns {Promise<string>} 字段类型（text/date/select）
 */
export async function askSearchFieldType(rl) {
  console.log('\n📋 选择搜索字段类型:')
  console.log('  1. 文本输入 (Text) - 普通文本搜索框')
  console.log('  2. 日期范围 (DateRange) - 日期范围选择器')
  console.log('  3. 下拉选择 (Select) - 下拉选择框')

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const answer = await rl.question('请选择字段类型 (1-3，默认1): ')
    const trimmed = answer.trim()
    const selection = trimmed ? parseInt(trimmed, 10) : 1

    if (selection === 1 || (!trimmed && selection === 1)) {
      console.log('✅ 已选择: 文本输入\n')
      return 'text'
    }
    if (selection === 2) {
      console.log('✅ 已选择: 日期范围\n')
      return 'dateRange'
    }
    if (selection === 3) {
      console.log('✅ 已选择: 下拉选择\n')
      return 'select'
    }
    console.log('请输入有效的选项编号 (1-3)')
  }
}

/**
 * 询问增强的搜索条件配置（支持字段类型）
 * @param {Object} rl - 问答接口对象
 * @returns {Promise<Array<{label: string, field: string, type: string, options?: string[]}>>} 搜索条件配置数组
 */
export async function askEnhancedSearchFields(rl) {
  const searchFields = []
  console.log('\n📋 配置搜索条件（支持文本、日期范围、下拉选择）')
  console.log('提示：输入完成后，当询问是否继续添加时选择 N 即可退出\n')

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const label = await askQuestion(
      rl,
      `请输入搜索框标签（如：姓名、创建时间等，直接回车跳过）: `,
    )

    // 如果用户直接回车，询问是否继续
    if (!label) {
      // eslint-disable-next-line no-await-in-loop
      const continueAdd = await askYesNo(rl, '是否继续添加搜索条件？')
      if (!continueAdd) {
        break
      }
    } else {
      // eslint-disable-next-line no-await-in-loop
      const field = await askQuestion(
        rl,
        `请输入对应的字段名（驼峰命名，如：userName、createTime）: `,
        (value) => {
          if (!value.trim()) {
            return { valid: false, message: '❌ 字段名不能为空' }
          }
          if (!/^[a-z][a-zA-Z0-9]*$/.test(value.trim())) {
            return {
              valid: false,
              message:
                '❌ 字段名必须使用驼峰命名（首字母小写，只能包含字母和数字）',
            }
          }
          return { valid: true }
        },
      )

      // 询问字段类型
      // eslint-disable-next-line no-await-in-loop
      const fieldType = await askSearchFieldType(rl)

      const fieldConfig = {
        label: label.trim(),
        field: field.trim(),
        type: fieldType,
      }

      // 如果是下拉选择，询问选项
      if (fieldType === 'select') {
        console.log(
          '💡 提示：下拉选项将在代码中手动配置，这里只需确认需要下拉选择',
        )
      }

      // 如果是日期范围，提示字段命名建议
      if (fieldType === 'dateRange') {
        console.log('💡 提示：日期范围将生成 startTime 和 endTime 两个查询参数')
      }

      searchFields.push(fieldConfig)

      let typeLabel = '文本'
      if (fieldType === 'dateRange') {
        typeLabel = '日期范围'
      } else if (fieldType === 'select') {
        typeLabel = '下拉选择'
      }
      console.log(
        `✅ 已添加搜索条件: ${label.trim()} (${field.trim()}) [${typeLabel}]\n`,
      )

      // 询问是否继续添加
      // eslint-disable-next-line no-await-in-loop
      const continueAdd = await askYesNo(rl, '是否继续添加搜索条件？')
      if (!continueAdd) {
        break
      }
      console.log('')
    }
  }

  return searchFields
}

/**
 * 询问表格配置
 * @param {Object} rl - 问答接口对象
 * @returns {Promise<Object>} 表格配置对象
 */
export async function askTableConfig(rl) {
  console.log('\n📋 配置表格功能:')

  const showIndexColumn = await askYesNo(rl, '是否显示序号列？')
  const enableSelection = await askYesNo(rl, '是否启用多选功能？')
  // 不再询问是否启用批量删除，默认不启用
  const enableBatchDelete = false

  const config = {
    showIndexColumn,
    enableSelection,
    enableBatchDelete,
  }

  console.log('\n✅ 表格配置完成:')
  console.log(`   序号列: ${showIndexColumn ? '✅ 显示' : '❌ 隐藏'}`)
  console.log(`   多选功能: ${enableSelection ? '✅ 启用' : '❌ 禁用'}`)
  if (enableSelection) {
    console.log(`   批量删除: ${enableBatchDelete ? '✅ 启用' : '❌ 禁用'}`)
  }
  console.log('')

  return config
}

/**
 * 询问表单布局配置
 * @param {Object} rl - 问答接口对象
 * @returns {Promise<string>} 布局类型（single/two）
 */
export async function askFormLayout(rl) {
  console.log('\n📋 配置表单布局:')
  console.log('  1. 单列布局 (Single) - 表单项占满整行')
  console.log('  2. 两列布局 (Two) - 表单项两列排列')

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const answer = await rl.question('请选择表单布局 (1-2，默认1): ')
    const trimmed = answer.trim()
    const selection = trimmed ? parseInt(trimmed, 10) : 1

    if (selection === 1 || (!trimmed && selection === 1)) {
      console.log('✅ 已选择: 单列布局\n')
      return 'single'
    }
    if (selection === 2) {
      console.log('✅ 已选择: 两列布局\n')
      return 'two'
    }
    console.log('请输入有效的选项编号 (1-2)')
  }
}

/**
 * 询问其他功能配置
 * @param {Object} rl - 问答接口对象
 * @returns {Promise<Object>} 其他功能配置对象
 */
export async function askOtherFeatures(rl) {
  console.log('\n📋 配置其他功能:')

  const enableExport = await askYesNo(rl, '是否需要导出功能（导出Excel）？')
  const enableImport = await askYesNo(rl, '是否需要导入功能（导入Excel）？')

  const config = {
    enableExport,
    enableImport,
  }

  if (enableExport || enableImport) {
    console.log('\n✅ 其他功能配置完成:')
    if (enableExport) {
      console.log('   ✅ 已启用导出功能')
    }
    if (enableImport) {
      console.log('   ✅ 已启用导入功能')
    }
    console.log('')
  } else {
    console.log('\n✅ 未启用其他功能\n')
  }

  return config
}

/**
 * 询问表单字段配置
 * @param {Object} rl - 问答接口对象
 * @param {string} formType - 表单类型（add/edit）
 * @returns {Promise<Array<{label: string, field: string, type: string, required: boolean, placeholder?: string}>>} 字段配置数组
 */
export async function askFormFields(rl, formType = 'add') {
  const formFields = []
  const formTypeLabel = formType === 'add' ? '新增' : '编辑'
  console.log(`\n📋 配置${formTypeLabel}表单字段`)
  console.log('提示：输入完成后，当询问是否继续添加时选择 N 即可退出\n')

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const label = await askQuestion(
      rl,
      `请输入字段标签（如：姓名、年龄等，直接回车跳过）: `,
    )

    if (!label) {
      // eslint-disable-next-line no-await-in-loop
      const continueAdd = await askYesNo(rl, '是否继续添加字段？')
      if (!continueAdd) {
        break
      }
    } else {
      // eslint-disable-next-line no-await-in-loop
      const field = await askQuestion(
        rl,
        `请输入字段名（驼峰命名，如：userName、age）: `,
        (value) => {
          if (!value.trim()) {
            return { valid: false, message: '❌ 字段名不能为空' }
          }
          if (!/^[a-z][a-zA-Z0-9]*$/.test(value.trim())) {
            return {
              valid: false,
              message:
                '❌ 字段名必须使用驼峰命名（首字母小写，只能包含字母和数字）',
            }
          }
          return { valid: true }
        },
      )

      // 询问字段类型
      console.log(`\n📋 选择字段类型:`)
      console.log('  1. 文本输入 (Input)')
      console.log('  2. 数字输入 (Number)')
      console.log('  3. 文本域 (Textarea)')
      console.log('  4. 下拉选择 (Select)')
      console.log('  5. 日期选择 (DatePicker)')
      console.log('  6. 开关 (Switch)')
      console.log('  7. 单选框 (Radio)')
      console.log('  8. 复选框 (Checkbox)')

      // eslint-disable-next-line no-constant-condition
      let fieldType = 'input'
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const typeAnswer = await rl.question('请选择字段类型 (1-8，默认1): ')
        const trimmed = typeAnswer.trim()
        const selection = trimmed ? parseInt(trimmed, 10) : 1

        const typeMap = {
          1: 'input',
          2: 'number',
          3: 'textarea',
          4: 'select',
          5: 'date',
          6: 'switch',
          7: 'radio',
          8: 'checkbox',
        }

        if (selection >= 1 && selection <= 8) {
          fieldType = typeMap[selection]
          const typeLabels = {
            input: '文本输入',
            number: '数字输入',
            textarea: '文本域',
            select: '下拉选择',
            date: '日期选择',
            switch: '开关',
            radio: '单选框',
            checkbox: '复选框',
          }
          console.log(`✅ 已选择: ${typeLabels[fieldType]}\n`)
          break
        }
        console.log('请输入有效的选项编号 (1-8)')
      }

      // 询问是否必填
      // eslint-disable-next-line no-await-in-loop
      const required = await askYesNo(rl, '该字段是否必填？')

      // 询问占位符（可选）
      // eslint-disable-next-line no-await-in-loop
      const placeholder = await askQuestion(
        rl,
        `请输入占位符文本（可选，直接回车跳过）: `,
      )

      const fieldConfig = {
        label: label.trim(),
        field: field.trim(),
        type: fieldType,
        required,
        placeholder: placeholder.trim() || undefined,
      }

      formFields.push(fieldConfig)

      console.log(
        `✅ 已添加字段: ${label.trim()} (${field.trim()}) [${fieldType}${required ? ', 必填' : ', 可选'}]\n`,
      )

      // 询问是否继续添加
      // eslint-disable-next-line no-await-in-loop
      const continueAdd = await askYesNo(rl, '是否继续添加字段？')
      if (!continueAdd) {
        break
      }
      console.log('')
    }
  }

  return formFields
}

/**
 * 询问是否使用模板
 * @param {Object} rl - 问答接口对象
 * @returns {Promise<{useTemplate: boolean, templateName?: string}>} 模板选择结果
 */
export async function askTemplateSelection(rl) {
  const { listTemplates } = await import('./template-manager.js')
  const templates = listTemplates()

  if (templates.length === 0) {
    console.log('\n💡 提示: 暂无保存的配置模板')
    return { useTemplate: false }
  }

  console.log('\n📋 可用的配置模板:')
  templates.forEach((template, index) => {
    const date = template.createdAt
      ? new Date(template.createdAt).toLocaleDateString('zh-CN')
      : '未知日期'
    console.log(`  ${index + 1}. ${template.name} (创建于: ${date})`)
  })
  console.log(`  ${templates.length + 1}. 不使用模板，手动配置`)

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const answer = await rl.question(`请选择模板 (1-${templates.length + 1}): `)
    const selection = parseInt(answer.trim(), 10)

    if (selection >= 1 && selection <= templates.length) {
      const selectedTemplate = templates[selection - 1]
      console.log(`✅ 已选择模板: ${selectedTemplate.name}\n`)
      return {
        useTemplate: true,
        templateName: selectedTemplate.name,
      }
    }
    if (selection === templates.length + 1) {
      console.log('✅ 将手动配置\n')
      return { useTemplate: false }
    }
    console.log(`请输入有效的选项编号 (1-${templates.length + 1})`)
  }
}

/**
 * 询问是否保存为模板
 * @param {Object} rl - 问答接口对象
 * @param {Object} config - 配置对象
 * @returns {Promise<boolean>} 是否保存成功
 */
export async function askSaveTemplate(rl, config) {
  const save = await askYesNo(rl, '是否将当前配置保存为模板？')
  if (!save) {
    return false
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const templateName = await askQuestion(
      rl,
      '请输入模板名称（只能包含字母、数字、下划线和连字符）: ',
      (value) => {
        if (!value.trim()) {
          return { valid: false, message: '❌ 模板名称不能为空' }
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(value.trim())) {
          return {
            valid: false,
            message: '❌ 模板名称只能包含字母、数字、下划线和连字符',
          }
        }
        return { valid: true }
      },
    )

    const { saveTemplate, listTemplates } = await import(
      './template-manager.js'
    )
    const existingTemplates = listTemplates()
    const exists = existingTemplates.some((t) => t.name === templateName)

    if (exists) {
      const overwrite = await askYesNo(
        rl,
        `模板 "${templateName}" 已存在，是否覆盖？`,
      )
      if (!overwrite) {
        const retry = await askYesNo(rl, '是否重新输入模板名称？')
        if (!retry) {
          return false
        }
        // 继续下一次循环
      } else {
        // 覆盖现有模板
        const success = saveTemplate(templateName, config)
        if (success) {
          console.log(`✅ 模板 "${templateName}" 已保存\n`)
          return true
        }
        console.log('❌ 保存模板失败\n')
        return false
      }
    } else {
      // 模板不存在，直接保存
      const success = saveTemplate(templateName, config)
      if (success) {
        console.log(`✅ 模板 "${templateName}" 已保存\n`)
        return true
      }
      console.log('❌ 保存模板失败\n')
      return false
    }

    const success = saveTemplate(templateName, config)
    if (success) {
      console.log(`✅ 模板 "${templateName}" 已保存\n`)
      return true
    }
    console.log('❌ 保存模板失败\n')
    return false
  }
}
