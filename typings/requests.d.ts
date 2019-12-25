declare namespace gameRequest {
  interface ICreateGame {
    gameName: string
    gameStartTime: number
    gameEndTime: number
    gameAvailablePeriod: string[]
    requiredRefereeAmount: number
    avatar: string
  }

  interface IEnrolGame {
    gameId: string
    refereeName: string
    availablePeriod?: string[]
  }
}

declare namespace loginRequest {
  interface IWeixinUserInfo {
    avatarUrl: string
    city: string
    country: string
    /** 1: ♂ */
    gender: number
    language: string
    nickName: string
    province: string
  }
  interface ILoginRequest {
    code: string
    identity: {
      signature: string
      rawData: string
    }
    userInfo: IWeixinUserInfo
  }
}

declare namespace refereeRequest {
  interface IUpdateInfo {
    refereeName?: string
    refereeHeight?: string
    refereeWeight?: string
    refereePhoneNumber?: string
    refereeIdNumber?: string
    refereeScholarId?: string
    refereeCardNumber?: string
    refereeClass?: string
  }
}
