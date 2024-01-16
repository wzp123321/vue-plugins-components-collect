declare namespace energyConservation {

    interface getListType {
        energyCode: string,
        orders: object[],
        pageNum: number,
        pageSize: number
        quotaEndTime: string
        quotaStartTime: string
        quotaType: string
        searchCount: boolean

    }

    interface returnListTYPE {
        list: any
        pageNum: number
        pageSize: number
        pages: number
        total: number
    }

    interface addUrlType {
        energyCode: tring
        // highAlarm: number | string
        // highWarning: number | string
        inputSource: any
        // lowAlarm: number | string
        // lowWarning: number | string
        quotaTime: string
        quotaType: string
        quotaValue: number
        treeId: number
    }

    interface upadateUrlType {
        highAlarm: number | string
        highWarning: number | string
        id: number
        inputSource: any
        lowAlarm: number | string
        lowWarning: number | string
        quotaValue: number

    }

    interface downloadType {
        treeTypes: string
    }

  
}