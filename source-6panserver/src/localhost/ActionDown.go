package localhost

func DownList(DownPage string) string {
	if DownPage == "downing" {
		return DowningList()
	} else if DownPage == "downed" {
		return DownedList()
	} else if DownPage == "uploading" {
		return UploadingList()
	} else if DownPage == "upload" {
		return UploadList()
	}
	return ToErrorMessageJSON("不支持的操作")
}

func DownStart(DownPage string, DownID string) string {
	if DownID == "all" && DownPage == "downing" {
		return DowningStartAll()
	}
	if DownID == "all" && DownPage == "uploading" {
		return UploadingStartAll()
	}

	if DownPage == "downing" {
		return DowningStart(DownID)
	}
	if DownPage == "uploading" {
		return UploadingStart(DownID)
	}
	return ToErrorMessageJSON("不支持的操作")
}

func DownStop(DownPage string, DownID string) string {
	if DownID == "all" && DownPage == "downing" {
		return DowningStopAll()
	}
	if DownID == "all" && DownPage == "uploading" {
		return UploadingStopAll()
	}

	if DownPage == "downing" {
		return DowningStop(DownID)
	}
	if DownPage == "uploading" {
		return UploadingStop(DownID)
	}
	return ToErrorMessageJSON("不支持的操作")
}

func DownDelete(DownPage string, DownID string) string {
	if DownID == "all" && DownPage == "downing" {
		return DowningDeleteAll()
	}
	if DownID == "all" && DownPage == "uploading" {
		return UploadingDeleteAll()
	}

	if DownPage == "downing" {
		return DowningDelete(DownID)
	}
	if DownPage == "uploading" {
		return UploadingDelete(DownID)
	}

	if DownID == "all" && DownPage == "downed" {
		return DownedDeleteAll()
	}
	if DownID == "all" && DownPage == "upload" {
		return UploadDeleteAll()
	}

	if DownPage == "downed" {
		return DownedDelete(DownID)
	}
	if DownPage == "upload" {
		return UploadDelete(DownID)
	}

	return ToErrorMessageJSON("不支持的操作")
}
