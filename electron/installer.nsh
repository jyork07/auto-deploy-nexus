; ViraPilot Installer Script
; This script handles custom installation steps

!macro customInstall
  ; Create desktop shortcut
  CreateShortCut "$DESKTOP\ViraPilot.lnk" "$INSTDIR\ViraPilot.exe"
  
  ; Create start menu folder
  CreateDirectory "$SMPROGRAMS\ViraPilot"
  CreateShortCut "$SMPROGRAMS\ViraPilot\ViraPilot.lnk" "$INSTDIR\ViraPilot.exe"
  CreateShortCut "$SMPROGRAMS\ViraPilot\Uninstall ViraPilot.lnk" "$INSTDIR\Uninstall ViraPilot.exe"
  
  ; Set file associations
  WriteRegStr HKCR ".virapilot" "" "ViraPilot.Config"
  WriteRegStr HKCR "ViraPilot.Config" "" "ViraPilot Configuration File"
  WriteRegStr HKCR "ViraPilot.Config\DefaultIcon" "" "$INSTDIR\ViraPilot.exe,0"
  WriteRegStr HKCR "ViraPilot.Config\shell\open\command" "" '"$INSTDIR\ViraPilot.exe" "%1"'
!macroend

!macro customUnInstall
  ; Remove desktop shortcut
  Delete "$DESKTOP\ViraPilot.lnk"
  
  ; Remove start menu folder
  RMDir /r "$SMPROGRAMS\ViraPilot"
  
  ; Remove file associations
  DeleteRegKey HKCR ".virapilot"
  DeleteRegKey HKCR "ViraPilot.Config"
!macroend