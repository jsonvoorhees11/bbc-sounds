using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace BBCAudioDownload
{
    public class Podcast
    {
        [JsonPropertyName("id")]
        public string BrandId { get; set; }
        [JsonPropertyName("tracks")]
        public IEnumerable<Track> Tracks { get; set; }
    }
    public class Track
    {
        [JsonPropertyName("url")]
        public string Url { get; set; }
        [JsonPropertyName("downloadLink")]
        public string DownloadLink { get; set; }
    }
}
