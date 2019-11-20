package date

import (
	"math"
	"strconv"
	"strings"
	"time"
)

func s(x float64) string {
	if int(x) == 1 {
		return ""
	}
	return "s"
}

func TimeElapsed(now time.Time, then time.Time, full bool) string {
	var parts []string
	var text string

	year2, month2, day2 := now.Date()
	hour2, minute2, _ := now.Clock()

	year1, month1, day1 := then.Date()
	hour1, minute1, _ := then.Clock()

	year := math.Abs(float64(int(year2 - year1)))
	month := math.Abs(float64(int(month2 - month1)))
	day := math.Abs(float64(int(day2 - day1)))
	hour := math.Abs(float64(int(hour2 - hour1)))
	minute := math.Abs(float64(int(minute2 - minute1)))

	if year > 0 {
		parts = append(parts, strconv.Itoa(int(year))+" year"+s(year))
	}

	if month > 0 {
		parts = append(parts, strconv.Itoa(int(month))+" month"+s(month))
	}

	if day > 0 {
		parts = append(parts, strconv.Itoa(int(day))+" day"+s(day))
	}

	if hour > 0 {
		parts = append(parts, strconv.Itoa(int(hour))+" hour"+s(hour))
	}

	if minute > 0 {
		parts = append(parts, strconv.Itoa(int(minute))+" minute"+s(minute))
	}

	if now.After(then) {
		text = " ago"
	} else {
		text = " after"
	}

	if len(parts) == 0 {
		return "just now"
	}

	if full {
		return strings.Join(parts, ", ") + text
	}
	return parts[0] + text
}
