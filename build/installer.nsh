!macro customInstall
  DetailPrint "Registering habios protocol..."
  DeleteRegKey HKCR "habios"
  WriteRegStr HKCR "habios" "" "URL:habiOS Protocol"
  WriteRegStr HKCR "habios" "URL Protocol" ""
  WriteRegStr HKCR "habios\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCR "habios\shell" "" ""
  WriteRegStr HKCR "habios\shell\open" "" ""
  WriteRegStr HKCR "habios\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
!macroend

!macro customUnInstall
  DeleteRegKey HKCR "habios"
!macroend