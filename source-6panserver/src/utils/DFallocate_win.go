// +build windows

package utils

import (
	"os"
	"syscall"
)

func IsWindows() bool {
	return true
}
func IsLinux() bool {
	return false
}
func IsDarwin() bool {
	return false
}
func DFallocate(f *os.File, size int64) error {
	stat, err := f.Stat()
	if err != nil {
		return err
	}
	if stat.Size() > size {
		return nil
	}
	return syscall.Ftruncate(syscall.Handle(f.Fd()), size)
}
