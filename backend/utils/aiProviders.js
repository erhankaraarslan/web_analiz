const { OpenAI } = require('openai');
const logger = require('./logger');

// AI Sağlayıcı factory
class AIProviderFactory {
  static getProvider(providerName) {
    switch(providerName.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider();
      case 'anthropic':
        // Anthropic yerine OpenAI kullan
        logger.warn('Anthropic sağlayıcısı mevcut değil, OpenAI kullanılıyor.');
        return new OpenAIProvider();
      default:
        throw new Error(`Bilinmeyen AI sağlayıcısı: ${providerName}`);
    }
  }
}

// OpenAI sağlayıcısı
class OpenAIProvider {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async analyzeSentiment(reviews) {
    try {
      logger.info('OpenAI ile duygu analizi başlıyor', { reviewCount: reviews.length });
      
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Sen bir kullanıcı yorumları analiz uzmanısın. Verilen yorumları analiz et ve duygu durumunu, ana konuları ve öncelikli sorunları belirle."
          },
          {
            role: "user",
            content: `Aşağıdaki Garanti BBVA Kripto mobil uygulaması yorumlarını analiz et. Duygu durumu, yaygın şikayetler, övgüler ve iyileştirme önerileri ile ilgili detaylı bir analiz sağla:\n\n${JSON.stringify(reviews)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      logger.info('OpenAI ile duygu analizi tamamlandı');
      return response.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI ile duygu analizi başarısız oldu', { error: error.message });
      throw new Error(`OpenAI ile analiz hatası: ${error.message}`);
    }
  }

  async createPersonas(reviews) {
    try {
      logger.info('OpenAI ile kullanıcı persona analizi başlıyor', { reviewCount: reviews.length });
      
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Sen bir kullanıcı deneyimi uzmanısın. Yorumları analiz ederek belirgin kullanıcı personaları oluştur."
          },
          {
            role: "user",
            content: `Aşağıdaki Garanti BBVA Kripto mobil uygulaması yorumlarını analiz ederek en az 3, en fazla 5 farklı kullanıcı personası oluştur. Her persona için davranış, ihtiyaç, beklentiler ve deneyim düzeyleri belirle:\n\n${JSON.stringify(reviews)}`
          }
        ],
        temperature: 0.4,
        max_tokens: 2000
      });

      logger.info('OpenAI ile kullanıcı persona analizi tamamlandı');
      return response.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI ile kullanıcı persona analizi başarısız oldu', { error: error.message });
      throw new Error(`OpenAI ile persona analizi hatası: ${error.message}`);
    }
  }

  async generateImprovementRecommendations(reviews) {
    try {
      logger.info('OpenAI ile iyileştirme önerileri oluşturuluyor', { reviewCount: reviews.length });
      
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Sen bir ürün geliştirme danışmanısın. Kullanıcı yorumlarını analiz ederek somut iyileştirme önerileri sunuyorsun."
          },
          {
            role: "user",
            content: `Aşağıdaki Garanti BBVA Kripto mobil uygulaması yorumlarını analiz ederek önceliklendirilmiş iyileştirme önerileri sun. Öneriler somut, uygulanabilir ve kullanıcı deneyimini geliştirmeye yönelik olmalı:\n\n${JSON.stringify(reviews)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      logger.info('OpenAI ile iyileştirme önerileri tamamlandı');
      return response.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI ile iyileştirme önerileri oluşturma başarısız oldu', { error: error.message });
      throw new Error(`OpenAI ile öneri oluşturma hatası: ${error.message}`);
    }
  }
}

module.exports = {
  AIProviderFactory
};