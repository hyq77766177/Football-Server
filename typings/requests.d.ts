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
