<template>
	<div class="te-globalnav">
		<!-- 左侧容器 -->
		<div class="te-globalnav-left">
			<img class="te-globalnav-left-logo" :src="logo" alt="" />
			<span class="te-globalnav-left-title">{{ navTitle }}</span>
			<!-- 左侧菜单 -->
			<div v-if="leftMenuConfig" class="te-globalnav-menu">
				<div v-for="item in leftMenuConfig" :class="[{ 'te-globalnav-menu-selected': item.checked }, 'te-globalnav-menu-item']" @click="leftMenuClick(item)">
					<component :is="item.icon" />
					<span>{{ item.title }}</span>
				</div>
			</div>
		</div>

		<!-- 右侧容器 -->
		<div class="te-globalnav-right">
			<slot name="globalnav-right-custom"></slot>
			<!-- 右侧菜单区（告警、待办、消息等） -->
			<template v-for="menu in rightMenuConfig">
				<te-dropdown v-if="menu.list" popper-class="te-globalnav-dropdown" class="te-globalnav-button">
					<div class="te-globalnav-button" @click="emit('menuChanged', menu)">
						<component :is="menu.icon" />
						<span class="te-globalnav-button-warn">{{ menu.count > 99 ? "99+" : menu.count }}</span>
					</div>
					<template #dropdown>
						<el-dropdown-menu>
							<te-dropdown-item v-for="(item, index) in menu.list" @click="emit('menuChanged', item)">
								<div class="te-globalnav-button-item">
									<span :class="`te-globalnav-button-item-point${index + 1}`"></span>
									<span>{{ item.title }}</span>
									<span>{{ item.count > 99 ? "99+" : item.count }}</span>
								</div>
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>

				<div v-else @click="emit('menuChanged', menu)" class="te-globalnav-button">
					<component :is="menu.icon" />
					<span>{{ menu.count > 99 ? "99+" : menu.count }}</span>
				</div>
			</template>
			<!-- 院区 -->
			<te-dropdown
				v-if="hospitalConfig?.list"
				popper-class="te-globalnav-dropdown"
				:hide-on-click="false"
				:max-height="500"
				@visible-change="(visible: boolean) => {
        if (!visible) {
          if (hospitalCheckChanged) {
            emit('hospitalChanged', hospitalConfig.list?.filter(el => el.checked))
            hospitalCheckChanged = false
          }
        }
      }">
				<div class="te-globalnav-user te-globalnav-hospital">
					<icon-yuanqu class="te-globalnav-user-img"></icon-yuanqu>
					<span class="te-globalnav-hospital-count">{{ hospitalConfig.count > 99 ? "99+" : hospitalConfig.count }}</span>
					<span>{{ hospitalConfig.title ? hospitalConfig.title : "院区" }}</span>
					<icon-caret-bottom></icon-caret-bottom>
				</div>
				<template #dropdown>
					<el-dropdown-menu>
						<te-dropdown-item disabled><div>院区选择</div></el-dropdown-item>
						<te-dropdown-item v-for="item in hospitalConfig?.list">
							<te-checkbox
								class="te-globalnav-user-item"
								v-model="item.checked"
								:label="item.title"
								:title="item.title"
								@change="(value: boolean) => {
                  if (hospitalConfig?.chooseMode == globalnavChooseMode.multiple || !hospitalConfig?.chooseMode) {
                    if (!value && hospitalConfig.list?.filter(el => el.checked).length <= 0) {
                      ElMessage.warning('至少选中一个院区');
                      item.checked = true;
                      return
                    }
                  } else {
                    hospitalConfig?.list.map(el => {
                      el.checked = false
                    })
                    item.checked = true;
                  }
                  
                  hospitalCheckChanged = true
                }" />
						</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
			<div class="te-globalnav-user te-globalnav-hospital" v-else-if="hospitalConfig">
				<icon-yuanqu class="te-globalnav-user-img"></icon-yuanqu>
				<span class="te-globalnav-hospital-count">{{ hospitalConfig.count > 99 ? "99+" : hospitalConfig.count }}</span>
				<span>{{ hospitalConfig.title ? hospitalConfig.title : "院区" }}</span>
			</div>
			<!-- 院区插槽 -->
			<div class="te-globalnav-user te-globalnav-project" v-else>
				<slot name="globalnav-project-custom"></slot>
			</div>
			<!-- 用户信息 -->
			<te-dropdown popper-class="te-globalnav-dropdown" v-if="userinfoConfig">
				<div class="te-globalnav-user">
					<img v-if="userinfoConfig.avatar?.length > 0" class="te-globalnav-user-img" :src="userinfoConfig.avatar" alt="" />
					<span>{{ userinfoConfig.nickname }}</span>
					<icon-caret-bottom></icon-caret-bottom>
				</div>
				<template #dropdown>
					<el-dropdown-menu>
						<te-dropdown-item v-if="userinfoConfig.organizationList" disabled><div>组织</div></el-dropdown-item>
						<te-dropdown-item v-for="item in userinfoConfig.organizationList" :icon="item.icon" @click="organizationMenuClick(item)">
							<div :class="item.checked ? 'te-globalnav-user-check' : ''">
								<span>{{ item.title }}</span>
								<icon-check v-if="item.checked" class="te-globalnav-user-check-icon"></icon-check>
							</div>
						</el-dropdown-item>
						<te-dropdown-item v-for="item in userinfoConfig.configList" :divided="item.divided" :icon="item.icon" @click="emit('menuChanged', item)">
							<div>{{ item.title }}</div>
						</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
			<!-- 用户信息插槽 -->
			<div class="te-globalnav-user" v-else-if="$slots['globalnav-user-custom']">
				<slot name="globalnav-user-custom"></slot>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ElCheckbox, ElDropdown, ElDropdownItem, ElDropdownMenu, ElMessage } from "element-plus";
	import { navProps, globalnavMenuItem, globalnavChooseMode } from "./constants";
	import "element-plus/theme-chalk/dark/css-vars.css";
	import { IconCaretBottom, IconCheck, IconYuanqu } from "@arco-iconbox/vue-te/esm";

	const props = withDefaults(defineProps<navProps>(), {
		logo: "",
		navTitle: "",
	});

	// 记录院区选中状态是否切换过
	let hospitalCheckChanged = false;

	const emit = defineEmits(["menuChanged", "hospitalChanged"]);

	/**
	 * 左侧菜单切换选中
	 * @param item 当前选中菜单数据
	 */
	const organizationMenuClick = (item: globalnavMenuItem) => {
		emit("menuChanged", item);
		props.userinfoConfig.organizationList.forEach((menu: globalnavMenuItem) => {
			menu.checked = menu.type == item.type;
		});
	};

	/**
	 * 左侧菜单切换选中
	 * @param item 当前选中菜单数据
	 */
	const leftMenuClick = (item: globalnavMenuItem) => {
		emit("menuChanged", item);
		props.leftMenuConfig.forEach((menu: globalnavMenuItem) => {
			menu.checked = menu.type == item.type;
		});
	};
</script>

<style scoped lang="less">
	.te-globalnav {
		background-color: #141414;
		display: flex;
		color: var(--te-color-white);
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 56px !important;
		color: #e5eaf3;
		padding: 0 var(--te-space-12);
		box-sizing: border-box;

		&-left {
			display: flex;
			overflow: hidden;
			align-items: center;
			height: 100%;

			&-logo {
				height: 32px;
				margin-right: var(--te-space-8);
			}
			&-title {
				margin-right: var(--te-space-16);
				border-right: 1px solid #414243;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				font-size: var(--te-font-size-h20);
				padding-right: var(--te-space-16);
			}
		}

		&-right {
			display: flex;
			box-sizing: border-box;
			align-items: center;
		}

		&-menu {
			display: flex;
			height: 100%;
			svg {
				font-size: var(--te-font-size-b16);
			}
			&-item {
				cursor: pointer;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0 var(--te-space-24);
				border-bottom: 2px solid #ffffff00;
				span {
					margin-left: var(--te-space-4);
				}
				&-point {
					width: 8px;
					height: 8px;
					border-radius: 50%;
					background-color: var(--te-color-white);
				}
			}
			&-selected {
				.te-globalnav-menu-item-point {
					background-color: var(--te-color-primary) !important;
				}
				color: var(--te-color-primary);
				border-bottom-color: var(--te-color-primary);
			}
			:hover.te-globalnav-menu-item {
				border-bottom-color: var(--te-color-primary);
			}
		}
		&-button {
			width: 56px;
			height: 54px;
			display: flex;
			align-items: center;
			justify-content: center;
			position: relative;
			cursor: pointer;
			> svg {
				font-size: var(--te-font-size-h24);
				color: var(--te-color-white);
			}
			span {
				position: absolute;
				font-size: var(--te-font-size-b12);
				color: var(--te-color-white);
				background-color: var(--te-color-primary);
				border-radius: 10px;
				-webkit-border-radius: 10px;
				top: 8px;
				left: 30px;
				padding: 0 6px;
				line-height: 18px;
			}
			&-warn {
				background-color: var(--te-color-danger) !important;
			}
		}
		&-user {
			margin: 0 var(--te-space-16) 0 var(--te-space-20);

			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--te-color-white);
			&-img {
				height: 24px;
				width: 24px;
				border-radius: 50%;
				margin-right: var(--te-space-4);
			}
			span {
				margin: 0 var(--te-space-4);
				white-space: nowrap;
			}
		}
		&-hospital {
			border-left: 1px solid #414243;
			padding-left: var(--te-space-20);
			position: relative;
			height: 28px;

			&-count {
				position: absolute;
				font-size: var(--te-font-size-b12);
				color: var(--te-color-white);
				background-color: var(--te-color-primary);
				border-radius: 10px;
				-webkit-border-radius: 10px;
				top: -7px;
				left: 28px;
				padding: 0 6px;
				line-height: 18px;
			}
		}
		&-project {
			border-left: 1px solid #414243;
			height: 28px;
		}
	}

	.te-dropdown {
		align-items: center;
	}

	.te-globalnav-dropdown {
		.te-globalnav-user-check {
			> span {
				color: var(--te-color-primary);
				font-weight: 600;
			}
			&-icon {
				margin-left: var(--te-space-12);
				color: var(--te-color-primary);
			}
		}
		.te-globalnav-button-item {
			display: flex;
			align-items: center;
			span:nth-child(1) {
				width: 8px;
				height: 8px;
				border-radius: 50%;
			}
			span {
				margin-right: 10px;
			}
			.te-globalnav-button-item-point1 {
				background-color: var(--te-color-danger);
			}
			.te-globalnav-button-item-point2 {
				background-color: var(--te-color-warning);
			}
			.te-globalnav-button-item-point3 {
				background-color: var(--te-color-warning-light-5);
			}
			.te-globalnav-button-item-point4 {
				background-color: var(--te-color-primary);
			}
		}
	}
</style>
